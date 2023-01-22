import { Card, CardBody, CardHeader, Heading, Text } from '@chakra-ui/react';
import { GetServerSideProps, type NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import TodoList from '../components/TodoList';
import { api } from '../utils/api';
import { authOptions } from './api/auth/[...nextauth]';
import type {} from 'next';

const Home: NextPage = () => {
  // Check if we're signed in
  const { data: sessionData } = useSession();
  // Only fetch todos if we're signed in
  const { data: todos } = api.todo.getAll.useQuery(undefined, { enabled: !!sessionData?.user });

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <main className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">
            {todos && <TodoList todos={todos} />}
            {!sessionData && (
              <Card>
                <CardHeader>
                  <Heading>Welcome to Raise Todo!</Heading>
                </CardHeader>
                <CardBody>
                  <Text>Please sign in to get started.</Text>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

// Get rid of the unauthed flash while loading
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await unstable_getServerSession(req, res, authOptions),
    },
  };
};
