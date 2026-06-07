import type { ReactNode } from "react";

import { Container, cn, tokens } from "@esigenta/ui";

type HomeContentRailProps = {
  children: ReactNode;
  className?: string;
};

export function HomeContentRail({
  children,
  className,
}: HomeContentRailProps) {
  return (
    <Container size="full" gutter="sm" className={tokens.home.railFrame}>
      <div className={cn(tokens.home.rail, className)}>
        {children}
      </div>
    </Container>
  );
}
