import {Expose} from 'class-transformer';

export class ClusterObjectSummary {
  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'id' })
  id: number;

  @Expose({ name: 'namespaces' })
  namespaces: NamespaceObjectSummary[];

}

class NamespaceObjectSummary {
  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'id' })
  id: number;

  @Expose({ name: 'pods' })
  pods: PodSummary[];
}

class PodSummary {
  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'id' })
  id: number;
}