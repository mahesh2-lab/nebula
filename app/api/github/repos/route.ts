import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const GITHUB_API = "https://api.github.com";
const repoCache = new Map<string, { projects: any[]; expiresAt: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache

interface ImportRequest {
  repositoryId: number;
  fullName?: string;
  defaultBranch?: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  clone_url: string;
  private: boolean;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Nebula",
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = (session as any).accessToken;
  const sessionError = (session as any).error;

  if (sessionError === "RefreshTokenError") {
    return NextResponse.json(
      { error: "GitHub token expired. Please sign in again." },
      { status: 401 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "GitHub account not connected." },
      { status: 400 }
    );
  }

  // Check cache first
  const cached = repoCache.get(token);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.projects);
  }

  try {
    const response = await fetch(
      `${GITHUB_API}/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator`,
      {
        headers: githubHeaders(token),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch repositories",
          details: await response.text(),
        },
        { status: response.status }
      );
    }

    const repos = await response.json();

    const projects = repos.map((repo: any) => ({
      id: repo.id,
      nodeId: repo.node_id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      defaultBranch: repo.default_branch,
      private: repo.private,
      visibility: repo.visibility,
      primaryLanguage: repo.language,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      owner: {
        login: repo.owner?.login || "",
        avatarUrl: repo.owner?.avatar_url || "",
      }
    }));

    // Cache the result
    repoCache.set(token, {
      projects,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message ?? "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = (session as any).accessToken;

    if (!token) {
      return NextResponse.json(
        { error: "GitHub account not connected." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as ImportRequest;

    if (!Number.isInteger(body.repositoryId) || body.repositoryId <= 0) {
      return NextResponse.json(
        { error: "Invalid repository ID." },
        { status: 400 }
      );
    }

    let repo: GitHubRepository;
    let commit: GitHubCommit;

    // Use Promise.all to fetch repository details and commit concurrently if fullName and defaultBranch are provided
    if (body.fullName && body.defaultBranch) {
      const [repoResponse, commitResponse] = await Promise.all([
        fetch(
          `${GITHUB_API}/repositories/${body.repositoryId}`,
          {
            headers: githubHeaders(token),
            cache: "no-store",
          }
        ),
        fetch(
          `${GITHUB_API}/repos/${body.fullName}/commits/${encodeURIComponent(body.defaultBranch)}`,
          {
            headers: githubHeaders(token),
            cache: "no-store",
          }
        )
      ]);

      if (!repoResponse.ok) {
        return NextResponse.json(
          { error: "Repository not found or inaccessible." },
          { status: repoResponse.status === 404 ? 404 : repoResponse.status }
        );
      }
      if (!commitResponse.ok) {
        return NextResponse.json(
          { error: "Failed to resolve repository HEAD commit." },
          { status: commitResponse.status }
        );
      }

      repo = await repoResponse.json();
      commit = await commitResponse.json();
    } else {
      // Fallback to sequential execution if fullName or defaultBranch are not provided
      const repoResponse = await fetch(
        `${GITHUB_API}/repositories/${body.repositoryId}`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      if (!repoResponse.ok) {
        return NextResponse.json(
          { error: "Repository not found or inaccessible." },
          { status: repoResponse.status === 404 ? 404 : repoResponse.status }
        );
      }

      repo = await repoResponse.json();

      const commitResponse = await fetch(
        `${GITHUB_API}/repos/${repo.full_name}/commits/${encodeURIComponent(repo.default_branch)}`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      if (!commitResponse.ok) {
        return NextResponse.json(
          { error: "Failed to resolve repository HEAD commit." },
          { status: commitResponse.status }
        );
      }

      commit = await commitResponse.json();
    }

    const project = {
      githubRepositoryId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      cloneUrl: repo.clone_url,
      private: repo.private,
      latestCommitSha: commit.sha,
      latestCommit: {
        sha: commit.sha,
        shortSha: commit.sha.slice(0, 7),
        message: commit.commit.message,
        author: commit.commit.author?.name ?? null,
        authorLogin: commit.author?.login ?? null,
        authorAvatarUrl: commit.author?.avatar_url ?? null,
        committedAt: commit.commit.author?.date ?? null,
      },
    };

    return NextResponse.json(
      {
        project,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Repository import error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}