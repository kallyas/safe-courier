import React from "react";
import { useForm, useToggle, upperFirst } from "@mantine/hooks";
import {
  Grid,
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Anchor,
} from "@mantine/core";
import Layout from "../components/Layout";
import { SocialButtons } from "../components/SocialButtons";

const Login = () => {
  const [type, toggle] = useToggle("login", ["login", "register"]);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      username: "",
      firstName: "",
      lastName: "",
    },
    validationRules: {
      email: (value) => /^\S+@\S+$/.test(value),
      password: (value) => /^\S{6,}$/.test(value),
      username: (value) => /^\S{3,}$/.test(value),
      firstName: (value) => /^\S{3,}$/.test(value),
      lastName: (value) => /^\S{3,}$/.test(value),
    },
  });

  const onSubmit = form.onSubmit(() => {
    type === "login" ? console.log("login") : console.log("register");
  });

  return (
    <Layout>
      <Grid>
        <Grid.Col span={6} offset={4}>
          <Text size="lg" weight="bold">
            Welcome to safe courier - {upperFirst(type)}
          </Text>
        </Grid.Col>
      </Grid>
      <Grid justify="center" mt={30}>
        <Grid.Col span={6}>
          <Paper radius="md" padding="xl" withBorder>
            <SocialButtons />
            <Divider
              label="or continue with email"
              labelPosition="center"
              my="lg"
            />
            <form onSubmit={onSubmit}>
              <Group direction="column" grow>
                {type === "register" && (
                  <>
                    <TextInput
                      required
                      label="First Name"
                      name="firstName"
                      placeholder="Your name first name"
                      value={form.values.firstName}
                      onChange={(event) =>
                        form.setFieldValue(
                          "firstName",
                          event.currentTarget.value
                        )
                      }
                      error={form.errors.firstName && "First name should be at least 3 characters"}
                    />
                    <TextInput
                      required
                      label="Last Name"
                      name="lastName"
                      placeholder="Your name last name"
                      value={form.values.lastName}
                      onChange={(event) =>
                        form.setFieldValue(
                          "lastName",
                          event.currentTarget.value
                        )
                      }
                      error={form.errors.lastName && "last name should be at least 3 characters"}
                    />

                    <TextInput
                      required
                      label="Email"
                      placeholder="hello@safe-courier.com"
                      value={form.values.email}
                      onChange={(event) =>
                        form.setFieldValue("email", event.currentTarget.value)
                      }
                      error={form.errors.email && "Invalid email"}
                    />
                  </>
                )}

                <TextInput
                  required
                  label="Username"
                  placeholder="Username"
                  value={form.values.username}
                  onChange={(event) =>
                    form.setFieldValue("username", event.currentTarget.value)
                  }
                  error={form.errors.username && "Username should be at least 3 characters"}
                />

                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  value={form.values.password}
                  onChange={(event) =>
                    form.setFieldValue("password", event.currentTarget.value)
                  }
                  error={
                    form.errors.password &&
                    "Password should include at least 6 characters"
                  }
                />
              </Group>

              <Group position="apart" mt="xl">
                <Anchor
                  component="button"
                  type="button"
                  color="gray"
                  onClick={() => toggle()}
                  size="xs"
                >
                  {type === "register"
                    ? "Already have an account? Login"
                    : "Don't have an account? Register"}
                </Anchor>
                <Button type="submit">{upperFirst(type)}</Button>
              </Group>
            </form>
          </Paper>
        </Grid.Col>
      </Grid>
    </Layout>
  );
};

export default Login;
