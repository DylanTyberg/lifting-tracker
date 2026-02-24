#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ContainerWebAppStack } from '../lib/infastructure-stack';

const app = new cdk.App();

new ContainerWebAppStack(app, "DevContainerApp", {
  environment: "dev",
  containerImage: "183494328841.dkr.ecr.us-east-1.amazonaws.com/lifting-tracker-ecr:latest",
  containerPort: 80,
  desiredCount: 1,
  healthCheckPath: '/api/health',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
})