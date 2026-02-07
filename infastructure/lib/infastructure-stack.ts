import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface ContainerWebAppStackProps extends cdk.StackProps {
  environment: "dev" | "prod";
  containerImage: string;
  containerPort?: number;
  desiredCount?: number;
  cpu?: number;
  memory?: number;
  healthCheckPath?: string;
  databaseEngine?: "postgres" | 'mysql';
}

export class ContainerWebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ContainerWebAppStackProps) {
    super(scope, id, props)
  

    const environment = props.environment || "dev";

    const vpc = new ec2.Vpc(this, "AppVpc", {
      maxAzs: 2,
      natGateways: 0,
    })

    const cluster = new ecs.Cluster(this, "AppCluster", {
      vpc: vpc,
      containerInsights: environment === "prod",
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, "AppTaskDef", {
      cpu: 256,
      memoryLimitMiB: 512
    })

   

    const database = new dynamodb.Table(this, "ItemsTable", {
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      sortKey: {name: "sort_key", type: dynamodb.AttributeType.STRING},
      tableName: "LiftingTable",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    database.grantReadWriteData(taskDefinition.taskRole);

    const container = taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromRegistry(props.containerImage),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "app",
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        ENVIRONMENT: environment,
        DYNAMODB_TABLE_NAME: database.tableName,
        AWS_REGION: this.region,
      },
    })

    container.addPortMappings({
      containerPort:props.containerPort || 3000,
      protocol: ecs.Protocol.TCP,
    })

    const serviceSG = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "security group for fargate",
      allowAllOutbound: true,
    })

    serviceSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(props.containerPort || 3000),
      "Allow inbound traffic"
    )

    const service = new ecs.FargateService(this, "AppService", {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: "FARGATE_SPOT",
          weight: 1,
          base: 0
        }
      ],
      assignPublicIp: true,
      securityGroups: [serviceSG],
      vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC},
      healthCheckGracePeriod: cdk.Duration.seconds(60),

    })

    

    new cdk.CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
      description: "ECS Cluster name",
    })

    new cdk.CfnOutput(this, "ServiceName", {
      value: service.serviceName,
      description: "ECS Service Name"
    })

    new cdk.CfnOutput(this, "TableName", {
      value: database.tableName
    })

  }

}