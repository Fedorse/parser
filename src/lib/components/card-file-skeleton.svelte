<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<Card.Root class=" bg-card/20 max-w-96 overflow-hidden transition-all ">
  <Card.Header class="space-y-2">
    <div class="flex items-start justify-between">
      <Skeleton class="bg-muted/50 h-5 w-60 rounded" />
    </div>
    <Skeleton class="bg-muted/50 h-4 w-20 rounded" />
  </Card.Header>

  <Card.Content class="flex flex-col items-center space-y-3">
    <div class="space-y-2">
      <Skeleton class="bg-muted/50 h-8 w-24" />
      <Skeleton class="bg-muted/50 h-4 w-24" />
    </div>

    <div class="flex items-center gap-2">
      <Skeleton class="bg-muted/50 h-5 w-20 rounded-full" />
      <Skeleton class="bg-muted/50 h-5 w-20 rounded-full" />
    </div>
  </Card.Content>

  <Card.Footer>
    <div class="flex w-full items-center justify-between">
      <Skeleton class="bg-muted/50 h-8 w-20" />
      <Skeleton class="bg-muted/50 h-8 w-20" />
      <Skeleton class="bg-muted/50 h-8 w-20" />
    </div>
  </Card.Footer>
</Card.Root>
