export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
}

export enum DocType {
  STORY = 'STORY',
  ACT = 'ACT',
  CHAPTER = 'CHAPTER',
  SCENE = 'SCENE',
}

export interface DocumentDto {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  type: DocType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsistencyIssueDto {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  issueDescription: string;
  sourceReference?: string;
  suggestedFix?: string;
}

export interface ConsistencyCheckResponse {
  consistent: boolean;
  inconsistencies: ConsistencyIssueDto[];
}
