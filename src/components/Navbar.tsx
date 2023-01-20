import { signIn, signOut, useSession } from "next-auth/react";
import { Box, Button, ButtonGroup, Flex, Heading, Spacer, Icon } from "@chakra-ui/react";
import Link from "next/link";

const Navbar: React.FC = () => {

  const signUpLink = 'https://github.com/signup';

  const { data: sessionData } = useSession();

  return (
    <Flex minWidth='max-content' alignItems='center' gap='2'>
      <Box p='2'>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Icon boxSize={6}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Icon>
          <Heading size='md'>Raise Todo</Heading>
        </Flex>
      </Box>
      <Spacer />
      <ButtonGroup>
        {!sessionData && <Link href={signUpLink}><Button variant={'ghost'}>Sign Up</Button></Link>}
        <Button variant={'ghost'} onClick={sessionData ? () => void signOut() : () => void signIn('github')}>{sessionData ? "Sign out" : "Sign in"}</Button>
      </ButtonGroup>
    </Flex>
  );
};

export default Navbar;