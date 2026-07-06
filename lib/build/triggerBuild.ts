import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION || "us-east-1",
     credentials:{
        accessKeyId: 'AKIAW27ATA7F5PL6ZXTB',
        secretAccessKey: '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'
    }
});

const config = {
    CLUSTER: process.env.CLUSTER || "",
    TASK: process.env.TASK || "",
    SUBNETS: process.env.SUBNETS ? process.env.SUBNETS.split(",") : [],
    SECURITY_GROUPS: process.env.SECURITY_GROUPS ? process.env.SECURITY_GROUPS.split(",") : []
};

type ProjectConfig = {
    projectId: string;
    rootDir: string;
    githubUrl: string;
    buildCommand: string;
    outputDirectory: string;
    installCommand: string;
    deploymentId: string;
    branch: string;
};

export const buildProject = async (projectConfig: ProjectConfig, ecsEnv: { name: string; value: string }[]) => {

    try {

        const env = [
            ...ecsEnv,
            {
                name: "BUILD_PROJECT_ID",
                value: projectConfig.projectId
            },
            {
                name: "BUILD_REPO_URL",
                value: projectConfig.githubUrl
            },
            {
                name: "BUILD_ROOT_DIR",
                value: projectConfig.rootDir
            },
            {
                name: "BUILD_COMMAND",
                value: projectConfig.buildCommand
            },
            {
                name: "BUILD_OUTPUT_DIRECTORY",
                value: projectConfig.outputDirectory
            },
            {
                name: "BUILD_INSTALL_COMMAND",
                value: projectConfig.installCommand
            },
            {
                name: "BUILD_DEPLOYMENT_ID",
                value: projectConfig.deploymentId
            },
            {
                name: "BUILD_BRANCH",
                value: projectConfig.branch
            }
        ]

        console.log(config);


        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: config.SUBNETS,
                    securityGroups: config.SECURITY_GROUPS
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: "builder-image",
                        environment: env
                    }
                ]
            }
        });

        const res = await ecsClient.send(command);


        return {
            success: true,
            data: res
        }

    } catch (error) {
        return {
            success: false,
            error: error
        }
    }

}
