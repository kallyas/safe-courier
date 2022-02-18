import { Button, Group } from "@mantine/core";
import { MarkGithubIcon } from "@primer/octicons-react";
import FacebookIcon from "./FacebookIcon";
import TwitterIcon from "./TwitterIcon";
import GoogleIcon from "./GoogleIcon";

export function FacebookButton(props) {
  return (
    <Button
      leftIcon={<FacebookIcon />}
      sx={(theme) => ({
        backgroundColor: "#4267B2",
        color: "#fff",
        "&:hover": {
          backgroundColor: theme.fn.darken("#4267B2", 0.1),
        },
      })}
      {...props}
    />
  );
}

export function TwitterButton(props) {
  return (
    <Button
      component="a"
      leftIcon={<TwitterIcon />}
      variant="default"
      {...props}
    />
  );
}

export function GoogleButton(props) {
  return (
    <Button
      leftIcon={<GoogleIcon />}
      variant="default"
      color="gray"
      {...props}
    />
  );
}

export function GithubButton(props) {
  return (
    <Button
      {...props}
      leftIcon={<MarkGithubIcon />}
      sx={(theme) => ({
        backgroundColor:
          theme.colors.dark[theme.colorScheme === "dark" ? 9 : 6],
        color: "#fff",
        "&:hover": {
          backgroundColor:
            theme.colors.dark[theme.colorScheme === "dark" ? 9 : 6],
        },
      })}
    />
  );
}

export function SocialButtons() {
  return (
    <Group grow mb="md" mt="md">
      <TwitterButton radius="sm" />
      <FacebookButton radius="sm" />
      <GoogleButton radius="sm" />
      <GithubButton radius="sm" />
    </Group>
  );
}
