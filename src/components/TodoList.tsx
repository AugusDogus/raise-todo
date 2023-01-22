import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Heading,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import clsx from 'clsx';
import { useState } from 'react';
import { api } from '../utils/api';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Todo } from '@prisma/client';
import { useTrackParallelMutations } from '../hooks/useTrackParallelMutations';

const TodoList: React.FC<{ todos: Todo[] }> = ({ todos }) => {
  const [todo, setTodo] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { isOpen, onToggle, onClose } = useDisclosure();

  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  const utils = api.useContext();

  const mutationTracker = useTrackParallelMutations();

  const { mutate: createTodo } = api.todo.create.useMutation({
    onMutate: (input) => {
      mutationTracker.startOne();
      utils.todo.getAll.cancel();
      setTodo('');
      setError('');
      const previous = utils.todo.getAll.getData();

      // Create a new todo
      const newTodo = {
        id: Math.random().toString(),
        text: input.todo,
        completed: false,
        userId: 'optimistic',
        createdAt: new Date(),
      };

      // Add the new todo to the cache
      if (previous) utils.todo.getAll.setData(undefined, [...previous, newTodo]);
    },
    onSettled: () => {
      setTodo('');
      setError('');
      mutationTracker.endOne();
      if (mutationTracker.allEnded()) utils.todo.getAll.invalidate();
    },
    onError: (error) => {
      if (error.message.includes('too_small')) setError('Try typing something...');
    },
  });

  const { mutateAsync: toggle } = api.todo.toggle.useMutation({
    onMutate: (input) => {
      mutationTracker.startOne();
      utils.todo.getAll.cancel();
      const previous = utils.todo.getAll.getData();
      const todo = previous?.find((todo) => todo.id === input.id);
      if (todo && previous) {
        todo.completed = !todo.completed;
        utils.todo.getAll.setData(undefined, [...previous]);
      }
    },
    onSettled: () => {
      mutationTracker.endOne();
      if (mutationTracker.allEnded()) utils.todo.getAll.invalidate();
    },
  });

  const { mutateAsync: deleteCompleted } = api.todo.deleteCompleted.useMutation({
    onMutate: () => {
      utils.todo.getAll.cancel();
      mutationTracker.startOne();
      const previous = utils.todo.getAll.getData();
      if (previous) {
        const newTodos = previous.filter((todo) => !todo.completed);
        utils.todo.getAll.setData(undefined, newTodos);
      }
    },
    onSettled: () => {
      onToggle();
      mutationTracker.endOne();
      if (mutationTracker.allEnded()) utils.todo.getAll.invalidate();
    },
  });

  return (
    <Card>
      <CardBody>
        <Stack spacing={[1, 5]} direction={['column']}>
          <Stack direction={['row']}>
            <Input
              value={todo}
              onChange={(e) => setTodo(e.currentTarget.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createTodo({ todo });
                }
              }}
              placeholder="Dust the bananas"
              size="md"
            />
            <Button onClick={() => createTodo({ todo })} size="md" colorScheme="green">
              Create
            </Button>
          </Stack>
          {error && <p className="!-mb-2 !mt-1 font-semibold text-red-500">{error}</p>}
          <Divider borderColor="gray.200" />
          <div className="flex flex-col" ref={animationParent}>
            {todos.map((todo, i) => (
              <Checkbox
                className={clsx(todo.completed && 'text-slate-400 line-through')}
                onChange={() => toggle({ id: todo.id })}
                key={i}
                size="lg"
                colorScheme="green"
                isChecked={todo.completed}>
                {todo.text}
              </Checkbox>
            ))}
          </div>
        </Stack>
        {todos.length > 0 ? (
          <Popover isOpen={isOpen} closeOnBlur={true} onClose={onClose}>
            <PopoverTrigger>
              <div onClick={onToggle} className="absolute bottom-1 right-1 m-0 cursor-pointer p-0">
                <Icon boxSize={6}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    />
                  </svg>
                </Icon>
              </div>
            </PopoverTrigger>
            <PopoverContent width="auto">
              <Button variant={'ghost'} onClick={() => deleteCompleted()}>
                Delete all checked items
              </Button>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex flex-col items-center justify-center p-2">
            <Heading size="md" color="gray.700" paddingBottom={'20px'}>
              You're all done!
            </Heading>
            <Icon viewBox="0 0 128 128" width="128px" height="128px">
              <path
                fill="#fcc21b"
                d="M72.59 58.36c-.65 1.18-1.3 2.37-1.92 3.55l-.52.98-.05.08c1.83 2.43 3.4 5.04 4.64 7.69.18.37.35.75.52 1.13 1.77-.52 3.55-.81 5.29-.88-1.31-3.47-3.33-7.07-6.3-10.71-.52-.63-1.09-1.23-1.66-1.84zM77.93 85.16c-.37 0-.75.02-1.13.06-2.07 6.54-8.79 9.4-15.89 8.52-11.15-1.37-21.38-9.85-24.81-20.5-.7-2.13-.94-4.25-1.02-6.51-.2-5.82.92-12.05 6.75-14.46l.07-.03c.19-.08.38-.13.57-.19-.42-.63-.85-1.29-1.26-2.02-.58-1.03-.93-2.12-1.14-3.18-6.25 2.18-10.06 7.7-12.73 13.78-2.55 5.82-19.12 50.57-19.12 50.57l-2.22 6c-.76 2.08-1.94 4.17-1.94 6.44 0 2.65 2.36 4.46 5.02 3.72 1.78-.5 3.74-1.42 5.55-2.14 3.83-1.56 10.93-4.63 10.93-4.63l29.68-12.22s14.31-5.18 20.33-10.85c2.92-2.75 5.26-6.71 6.29-11.44-.21-.11-.43-.23-.65-.32-1-.41-2.07-.6-3.28-.6zM55.68 47.54c.77 1.47 1.62 3.14 1.94 5.21 1.42.6 2.78 1.32 4.07 2.17.45-1.44.92-2.86 1.41-4.31-.21-.13-.42-.28-.63-.4-2.11-1.2-4.48-2.22-6.95-2.98.06.11.11.2.16.31z"
              />
              <path
                fill="#d7598b"
                d="M111.93 31.98c-.16 1-.12 2.42.04 3.4.17 1.1.42 2.27.82 3.31.57 1.46 1.27.95 2.7.75.99-.13 1.91-.06 2.89-.26 1.03-.21 2.05-.48 3.08-.68 2.42-.46 3.63-1 3.12-3.55-.37-1.84-.98-3.67-1.46-5.49-.44-.39-1.29-.17-1.81-.05-.92.21-1.83.26-2.75.42-1.66.27-3.4.47-5.03.86-.83.18-1.47.43-1.6 1.29z"
              />
              <path
                fill="#40c0e7"
                d="M98.87 62c.38.87 1.31.65 2.22.85 2.02.46 4.07.41 6.14.41.77 0 2.72.29 3.27-.4.44-.56.06-1.67 0-2.32-.08-.85-.16-1.69-.24-2.54-.04-.4.03-3.02-.31-3.24-.58-.39-1.68-.2-2.34-.19-1.21.04-2.4.19-3.63.19-1.59 0-3.31.02-4.85.4-.54 1.43-.39 2.92-.39 4.49 0 .73-.16 1.67.13 2.35z"
              />
              <path
                fill="#d7598b"
                d="M91.92 105.19c-.83-1.23-1.24-2.88-3.09-2.7-1.74.17-3.28 1.55-4.81 2.3-.99.48-1.71 1.34-1.91 2.42-.23 1.23.28 2.21.87 3.26.44.79.73 1.7 1.08 2.53.36.86.91 1.63 1.28 2.48.25.6.17.55.72.76.28.1.74.18 1.04.19 1.75.05 3.65-1.72 4.92-2.76 1.02-.82 3.06-1.34 2.85-2.89-.15-1.15-.95-2.26-1.5-3.25-.46-.81-.95-1.59-1.45-2.34z"
              />
              <path
                fill="#40c0e7"
                d="M111.46 113.59c-.23-.15-.45-.24-.65-.27-1.06-.19-1.76 1.09-2.6 1.92-1.01.97-2.21 1.74-3.13 2.8-.99 1.16-.22 2.2.8 2.82 1.11.67 2.1 1.51 3.2 2.21.98.63 1.77 1.19 2.86.51.99-.62 1.54-1.71 2.22-2.62 1.26-1.7 3.41-3.07 1.3-4.94-1.18-1.05-2.7-1.57-4-2.43zM9 55.06c.05-.46 1.35-4.14.96-4.25-.89-.22-1.73-.64-2.63-.88-1.04-.27-2.11-.48-3.08-.96-1.17-.58-1.89-.29-2.38.36-.69.92-.91 2.57-1.24 3.58-.26.79-.42 1.69.14 2.25.64.63 1.7.99 2.53 1.26 1.04.34 2.2.94 3.27 1.04 1.46.16 2.28-1.16 2.43-2.4zM68.63 19.54c1.3.58 2.56.91 3.89 1.29.47.14.77.37 1.26.11.63-.32 1.33-1.43 1.68-2.04.83-1.51 1.44-3 2.01-4.59.31-.85 1.23-2.23 1-3.13-.2-.76-1.3-1.23-1.92-1.56-.83-.43-1.62-1.01-2.46-1.38-1.08-.47-2.56-.98-3.72-1.15-.64-.1-1.09.16-1.44.57-.32.37-.56.86-.8 1.31-1.21 2.32-2.7 5.81-2.65 8.49.02 1.27 2.19 1.65 3.15 2.08z"
              />
              <path
                fill="#d7598b"
                d="M16.65 33.3c.73 1.12 1.38 2.14 2.24 3.2.84 1.02 1.44 1.22 2.47.37.65-.52 1.39-.93 2.01-1.49.59-.52 1.08-1.18 1.67-1.72.42-.39 1.25-.78 1.49-1.32.33-.76-.36-1.42-.78-1.98-.52-.7-.92-1.46-1.49-2.16-.73-.88-1.52-1.71-2.34-2.53-.67-.67-1.48-1.7-2.24-2.22-.2-.13-.43-.22-.67-.25-.91-.13-1.99.39-2.7.81-.97.57-1.91 1.42-2.76 2.17-1.33 1.18-.04 2.73.74 3.85.78 1.08 1.62 2.13 2.36 3.27z"
              />
              <path
                fill="#40c0e7"
                d="M16.73 9.97c.67.72 1.5 1.59 2.44 2 .83.37 1.68-.37 2.35-.78.75-.46 1.36-1.13 1.92-1.8.51-.62 1.2-1.29 1.58-2.01.44-.82-.16-1.13-.77-1.62-.73-.6-1.47-1.22-2.09-1.94-.84-.98-1.68-2.08-2.57-2.98-.3-.31-.66-.39-1.04-.32-1.19.2-2.6 1.87-3.3 2.42-.56.43-1.54 1.19-1.71 1.9-.21.8.26 1.57.66 2.24.65 1.08 1.65 1.95 2.53 2.89z"
              />
              <path
                fill="#ed6c30"
                d="M45.86 29.19c1.38 4.78-2.3 8.47-2.7 13-.12 1.31-.12 2.62.1 3.88.14.82.37 1.62.78 2.35.54.96 1.16 1.83 1.73 2.73.56.87 1.06 1.75 1.4 2.76.75 2.24.23 4.26-.09 6.48-.26 1.77-1.16 3.44-2.24 4.84-.33.43-1.24.98-1.02 1.61.03.11.23.15.52.15 1.2 0 4.03-.73 4.44-.92 1.8-.87 2.85-2.63 3.78-4.33 1.38-2.52 2.27-5.46 1.88-8.35-.08-.66-.26-1.28-.48-1.88-.67-1.79-1.78-3.39-2.41-5.22-.08-.22-.16-.44-.22-.67-.92-3.58 1.29-7.09 3.15-9.94 1.83-2.79 2.52-6.89 1.22-10.09-.66-1.62-1.72-3.24-3.01-4.43-1.53-1.42-3.86-2.71-3.6-5.16.22-2.13 1.66-4.37 2.75-6.13.54-.89 2.24-2.71 2.18-3.73-.05-1.04-1.5-1.56-2.19-2.17-1.56-1.38-2.8-2.44-4.8-3.07-.36-.12-.66-.17-.94-.17-1.29 0-1.74 1.17-2.46 2.43-1.32 2.33-2.62 4.79-3.5 7.31-1.66 4.68-1.91 9.51 1.68 13.89 1.24 1.53 3.53 3.03 4.05 4.83zM62.08 69.54c.25.26.48.37.69.37.39 0 .7-.4.95-.87.19-.36.34-.73.46-1.12.67-2.25 2-4.48 3.1-6.56.2-.37.4-.73.59-1.09.76-1.43 1.54-2.86 2.35-4.28.63-1.12 1.26-2.25 1.94-3.33 1.78-2.85 4.18-5.89 7.2-7.48 1.9-1.02 4.04-1.49 5.95-2.5 2.17-1.13 3.44-2.84 4.85-4.79 1.4-1.93 2.13-4.31 3.41-6.34.54-.86.46-1.62 1.41-2.22 2.11-1.32 4.64-.87 6.98-1.32 5.53-1.06 6.02-8.35 10.54-10.98.95-.55 1.92-1.06 2.88-1.57.56-.3 1.64-.67 2.03-1.22.67-.94-.6-2.17-.98-3.03-.66-1.48-1.65-2.97-2.5-4.35-.72-1.16-1.36-2.21-2.64-2.21l-.25.02c-2.89.28-5.47 1.55-7.32 3.76-2.25 2.7-2.55 6.87-6.09 8.35-2.3.96-5.01.58-7.19 1.91-2.58 1.58-3.41 4.7-4.13 7.44-.54 2-.57 4.41-2.09 5.98-2.06 2.11-5.19 2.37-7.83 3.5-.71.31-1.39.68-2 1.16-3.35 2.64-5.25 6.97-6.75 10.85-.61 1.59-1.16 3.21-1.7 4.83-.5 1.51-.99 3.02-1.46 4.54-.24.78-.5 1.56-.74 2.35-.61 1.98-1.17 4.01-1.89 5.96-.5 1.25-.81 3.16.23 4.24zM127.44 86.8c-.19-.2-.46-.22-.73-.22l-.31.01-.17-.01c-.6-.04-1.1-.3-1.68-.5-2.67-.93-4.4-1.7-6.76-3.29-2.66-1.79-5.71-3.46-8.99-3.61l-.38-.01c-3.24 0-6.23 1.71-9.48 1.71h-.02c-3.6-.02-6.71-2.58-9.55-4.47-.24-.16-.48-.31-.74-.45-2.23-1.26-4.63-1.81-7.05-1.84-.06 0-.13-.02-.19-.02-1.67 0-3.35.26-4.99.72-1.6.44-3.15 1.08-4.63 1.87-2.11 1.12-4.14 2.47-5.99 3.97-1.03.83-2.16 1.78-2.86 2.93-.38.61-.9 2.93.07 3.31l.13.03c.38 0 1-.4 1.27-.57 2.16-1.33 4.44-2.49 6.87-3.25 1.99-.63 4.08-1.09 6.15-1.17.17-.01.35-.02.52-.02 1.49 0 2.97.23 4.41.79l.06.03c2.01.8 3.69 2.18 5.35 3.53 2.44 1.98 5.15 2.42 7.91 2.42 2.15 0 4.33-.26 6.46-.26 2.23 0 4.39.29 6.38 1.46 1.62.97 3.08 2.24 4.33 3.59 1.38 1.47 3.14 2.7 5.21 3.02.88.14 1.68.21 2.57.22h.02c1.5 0 2.07-1.73 2.83-2.72 1.04-1.34 1.76-2.88 2.71-4.29.4-.62 1.95-2.23 1.27-2.91z"
              />
            </Icon>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TodoList;
