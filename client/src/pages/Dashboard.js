import React, { useEffect } from 'react';
import {
  Container,
  AppShell,
  Header,
  Grid,
  Text,
  Group,
  SimpleGrid,
  useMantineTheme,
  Paper,
  ScrollArea,
  Table,
  ActionIcon,
  Menu,
} from '@mantine/core';
import Nav from '../components/Nav';
import { Stats } from '../components/Stats';
import {
  Messages,
  Note,
  Pencil,
  ReportAnalytics,
  Trash,
} from 'tabler-icons-react';
import ParcelTimeline from '../components/Timeline';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, logoutUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useMantineTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(authSelector)
  const navigate = useNavigate();

  const logout = () => dispatch(logoutUser());

  useEffect(() => {
    if (!user) {
      navigate('/auth')
    }
  }, [user, navigate])

  return (
    <AppShell
      padding="md"
      navbar={
        <Nav logout={logout} width={{ base: 300 }} height={500} p="xs">
          {/* Navbar content */}
          
        </Nav>
      }
      header={
        <Header height={60} p="xs">
          {/* Header content */}
          <Text fontSize="xl" fontWeight="bold">
            Dashboard
          </Text>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : '#f8f9fa',
        },
      })}
    >
      <Container mx={50}>
        <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Stats />
        </SimpleGrid>
        <Grid>
          <Grid.Col xs={8}>
            <Text>Recent Transactions</Text>
            <Paper>
              <ScrollArea mt={5}>
                <Table sx={{ minWidth: '100%' }} verticalSpacing="md">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td>
                          <Group spacing="sm">
                            <div>
                              <Text size="sm" weight={500}>
                                John Doe
                              </Text>
                              <Text size="sm" color="dimmed">
                                Software Engineer
                              </Text>
                            </div>
                          </Group>
                        </td>
                        <td>
                          <Text size="sm">johdoe@gmail.com</Text>
                          <Text size="sm" color="dimmed">
                            Email
                          </Text>
                        </td>
                        <td>
                          <Group spacing={0} position="right">
                            <ActionIcon>
                              <Pencil size={16} />
                            </ActionIcon>
                            <Menu transition="pop" withArrow placement="end">
                              <Menu.Item icon={<Messages size={16} />}>
                                Send message
                              </Menu.Item>
                              <Menu.Item icon={<Note size={16} />}>
                                Add note
                              </Menu.Item>
                              <Menu.Item icon={<ReportAnalytics size={16} />}>
                                Analytics
                              </Menu.Item>
                              <Menu.Item icon={<Trash size={16} />} color="red">
                                Terminate contract
                              </Menu.Item>
                            </Menu>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Paper>
          </Grid.Col>
          <Grid.Col xs={4}>
            <Text>Activity</Text>
            <ParcelTimeline />
          </Grid.Col>
        </Grid>
      </Container>
    </AppShell>
  );
};

export default Dashboard;
