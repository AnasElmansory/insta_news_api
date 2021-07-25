interface Result {
  data?: any;
  error?: any;
}

interface FollowResult {
  data: any;
  action: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}
