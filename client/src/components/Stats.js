import { Center, Group, Paper, RingProgress, Text } from "@mantine/core";
import React from "react";
import { ArrowUpRight } from "tabler-icons-react";

export const Stats = () => {
  return [1, 2, 3, 4].map((i) => (
    <Paper key={i} withBorder radius="md" p="xs" style={{ height: "80px" }}>
      <Group>
        <RingProgress
          size={60}
          roundCaps
          thickness={8}
          sections={[{ value: 60, color: "green" }]}
          label={
            <Center>
              <ArrowUpRight size={22} />
            </Center>
          }
        />
        <div>
          <Text
            color="dimmed"
            size="xs"
            transform="uppercase"
            weight={700}
            mt={7}
          >
            Page Views
          </Text>
          <Text size="xl" weight={700}>
            560
          </Text>
        </div>
      </Group>
    </Paper>
  ));
};
