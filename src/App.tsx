import './App.css'
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';

type UserApiResponse = {
  count: number;
  next: string;
  previous: null;
  results: Array<User>;
};

type User = {
  name: string;
  url: string;
};

interface UsersState {
  users: User[];
  setData: (users: User[]) => void;
}

const useUsersStore = create<UsersState>()(persist(devtools(immer((set) => ({
  users: [],
  setData: (users) => {
    set({ users })
  },
  
}))),{name: 'usersStorage', storage: createJSONStorage(() => sessionStorage),}));

const fetchAllUsers = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon/');
  const json = (await response.json()) as UserApiResponse;
  return json.results;
}

function App() {
  const { setData } = useUsersStore();

  const { data, isLoading } = useQuery(
    ["users"],
    fetchAllUsers,
    {
      onSuccess: setData,
      refetchOnWindowFocus: false,
    },

  );

  if (isLoading) {
    return <h3>Идет загрузка</h3>
  }

  if (!isLoading) console.log(data)
  const pokemonsList = data?.map((pokemon) => <li key={pokemon.url}>{pokemon.name}</li>) || []
  return (
    <ul>{pokemonsList}</ul>
  )
}

export default App
