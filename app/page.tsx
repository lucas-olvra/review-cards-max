import { redirect } from 'next/navigation';

// O middleware já garante que só chegamos aqui com sessão válida
// (usuários sem sessão são redirecionados para /login antes disso).
export default function Home() {
  redirect('/topics');
}
