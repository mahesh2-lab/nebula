'use client';

import * as React from 'react';
import { BookOpen, Key, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const dynamic = 'force-static';

export default function DocsApiPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied code block');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      url: 'https://api.nebula.dev/v1/deployments',
      desc: 'Trigger a new container deployment for a target project.',
      headers: [
        'Authorization: Bearer <API_KEY>',
        'Content-Type: application/json'
      ],
      body: JSON.stringify({
        projectId: "my-web-app",
        gitRef: "main",
        commitHash: "e34b9d0",
        variables: {
          NODE_ENV: "production"
        }
      }, null, 2),
      response: JSON.stringify({
        success: true,
        deploymentId: "dep-7e2b9c1",
        status: "queued",
        url: "https://my-web-app-dep-7e2b9c1.nebula.dev",
        createdAt: "2026-07-02T12:00:00Z"
      }, null, 2)
    },
    {
      method: 'GET',
      url: 'https://api.nebula.dev/v1/projects/{projectId}/logs',
      desc: 'Query historical and live application runtime logs.',
      headers: [
        'Authorization: Bearer <API_KEY>'
      ],
      body: null,
      response: JSON.stringify({
        logs: [
          { timestamp: "2026-07-02T12:05:00Z", text: "Database connected", type: "stdout" },
          { timestamp: "2026-07-02T12:05:01Z", text: "Application running on port 3000", type: "stdout" }
        ]
      }, null, 2)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <BookOpen className="h-4 w-4" />
          <span>Documentation</span>
          <span>/</span>
          <Key className="h-4 w-4 text-white" />
          <span className="text-white">API</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Nebula Developer API</h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
          Automate your workflows by making requests directly to our edge gateway using authorization keys.
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="border border-[#1f1f1f] bg-[#0c0c0e] p-6 rounded-md space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm ${
                  ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {ep.method}
                </span>
                <code className="text-xs font-mono text-white select-all">{ep.url}</code>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {ep.desc}
              </p>
            </div>

            {/* Headers */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono text-[#71717A] uppercase">Headers</h4>
              <pre className="text-xs font-mono bg-[#09090b] border border-[#1f1f1f]/60 p-3 rounded-sm text-[#A1A1AA] block">
                {ep.headers.join('\n')}
              </pre>
            </div>

            {/* Request Body if POST */}
            {ep.body && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-[#71717A] uppercase">Request Body</h4>
                  <button 
                    onClick={() => handleCopy(ep.body || '', `req-${idx}`)}
                    className="text-[9px] font-mono text-[#71717A] hover:text-white"
                  >
                    {copiedId === `req-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs font-mono bg-[#09090b] border border-[#1f1f1f]/60 p-3 rounded-sm text-[#FAFAFA] block overflow-x-auto">
                  {ep.body}
                </pre>
              </div>
            )}

            {/* Response */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-mono text-[#71717A] uppercase">Response Payload</h4>
                <button 
                  onClick={() => handleCopy(ep.response, `res-${idx}`)}
                  className="text-[9px] font-mono text-[#71717A] hover:text-white"
                >
                  {copiedId === `res-${idx}` ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono bg-[#09090b] border border-[#1f1f1f]/60 p-3 rounded-sm text-[#FAFAFA] block overflow-x-auto">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
