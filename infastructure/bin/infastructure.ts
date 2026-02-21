#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ContainerWebAppStack } from '../lib/infastructure-stack';

const app = new cdk.App();

new ContainerWebAppStack(app, "DevContainerApp", {
  environment: "dev",
  containerImage: "nginx:latest",
  containerPort: 80,
  desiredCount: 1,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
})