import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Workspace } from '@/types/workspace'

export interface WorkspaceCardProps {
  workspace: Workspace
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card className="hover:bg-muted/50 cursor-pointer">
      <CardHeader>
        <CardTitle>{workspace.title}</CardTitle>
        <CardDescription>Last updated {workspace.updatedAt}</CardDescription>
      </CardHeader>
    </Card>
  )
}
