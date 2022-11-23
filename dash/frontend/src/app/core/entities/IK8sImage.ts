export interface IK8sImage {
  id: number;
  name: string;
  image: string;
  deploymentName: string;
  namespace: string;
  compliant: boolean;
  imageId: number;
}
