import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Spacer,
  Icon,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
} from '@chakra-ui/react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const signUpLink = 'https://github.com/signup';

  const { data: sessionData } = useSession();

  return (
    <nav>
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Icon boxSize={6}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Icon>
            <Heading size="md">Raise Todo</Heading>
          </Flex>
        </Box>
        <Spacer />
        <Popover>
          <ButtonGroup>
            {sessionData?.user ? (
              <>
                <PopoverTrigger>
                  <Button variant="unstyled">
                    <Avatar
                      name={sessionData.user.name ?? 'Profile Picture'}
                      alignSelf="center"
                      size="sm"
                      src={sessionData.user.image as unknown as string}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent marginRight={2} width="auto">
                  <PopoverHeader>Signed in: {sessionData.user.name}</PopoverHeader>
                  <Button variant={'ghost'} onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </PopoverContent>
              </>
            ) : (
              <>
                <Link href={signUpLink}>
                  <Button variant={'ghost'}>Sign Up</Button>
                </Link>
                <Button size={'md'} variant={'ghost'} onClick={() => void signIn('github')}>
                  Sign in
                </Button>
              </>
            )}
          </ButtonGroup>
        </Popover>
      </Flex>
    </nav>
  );
};

export default Navbar;
