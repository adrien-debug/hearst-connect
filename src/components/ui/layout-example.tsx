'use client'

/**
 * Layout Example — Premium UI structure using primitives
 * Demonstrates: sidebar + main content with rigorous spacing
 */

import {
  Button,
  Card,
  Container,
  Divider,
  FlexRow,
  Grid,
  Header,
  ListItem,
  Panel,
  StatBlock,
} from './primitives'

export function LayoutExample() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR — Fixed width, full height */}
      <Panel width="280px" position="left">
        <Header height="64px" sticky>
          <span
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-black)',
              letterSpacing: 'var(--tracking-tight)',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
            }}
          >
            Brand
          </span>
        </Header>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
          }}
        >
          <ListItem selected active>
            <FlexRow gap="sm">
              <span>Overview</span>
            </FlexRow>
          </ListItem>

          <ListItem>
            <FlexRow gap="sm">
              <span>Positions</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                3
              </span>
            </FlexRow>
          </ListItem>

          <ListItem>
            <FlexRow gap="sm">
              <span>Simulation</span>
            </FlexRow>
          </ListItem>

          <Divider />

          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Available
          </div>

          <ListItem>
            <FlexRow gap="sm" justify="between" style={{ width: '100%' }}>
              <span>Prime</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                }}
              >
                12%
              </span>
            </FlexRow>
          </ListItem>

          <ListItem>
            <FlexRow gap="sm" justify="between" style={{ width: '100%' }}>
              <span>Growth</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                }}
              >
                15%
              </span>
            </FlexRow>
          </ListItem>
        </div>
      </Panel>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOP HEADER */}
        <Header height="64px" sticky>
          <FlexRow gap="md">
            <span
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Portfolio
            </span>
          </FlexRow>

          <FlexRow gap="md">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              0x5F…AA57
            </span>
          </FlexRow>
        </Header>

        {/* SCROLLABLE CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <Container size="xl">
            {/* STATS ROW */}
            <Grid columns={3} gap="md" style={{ marginBottom: 'var(--space-6)' }}>
              <Card padding="lg">
                <StatBlock label="Net Position" value="$988,180" delta="+2.4%" size="lg" />
              </Card>

              <Card padding="lg">
                <StatBlock
                  label="Available Yield"
                  value="$60,840"
                  delta="Claimable"
                  size="lg"
                />
              </Card>

              <Card padding="lg">
                <StatBlock label="Active Positions" value="3" size="lg" />
              </Card>
            </Grid>

            {/* CONTENT GRID */}
            <Grid columns={2} gap="md">
              <Card padding="lg" style={{ minHeight: '320px' }}>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)',
                    letterSpacing: 'var(--tracking-wide)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Resource Allocation
                </div>

                {/* Placeholder for chart */}
                <div
                  style={{
                    height: '200px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </Card>

              <Card padding="lg" style={{ minHeight: '320px' }}>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)',
                    letterSpacing: 'var(--tracking-wide)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Yield Trajectory
                </div>

                {/* Placeholder for chart */}
                <div
                  style={{
                    height: '200px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </Card>
            </Grid>

            {/* ACTION BAR */}
            <FlexRow
              gap="md"
              justify="end"
              style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <Button size="md" variant="subtle">
                Export
              </Button>
              <Button size="md" variant="accent">
                New Position
              </Button>
            </FlexRow>
          </Container>
        </div>
      </div>
    </div>
  )
}
