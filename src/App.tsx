import { useState } from 'react';
import Calendar from './Calendar';
import UserSelector from './UserSelector';
import mainImage from '../asset/main.png';
import useCalendarStore from './stores/calendarStore';

function App() {
  const [users, setUsers] = useState(['Guest']);
  const [selectedUser, setSelectedUser] = useState('Guest');
  const [newUserName, setNewUserName] = useState('');

  const cancelChanges = useCalendarStore((state) => state.cancelChanges);

  const handleUserChange = (user: string) => {
    setSelectedUser(user);
    cancelChanges();
  }
  const onAddUser = () => {
    const trimmed = newUserName.trim();
    if (!trimmed) return;
    setUsers((current) => {
      if (current.includes(trimmed)) return current;
      return [...current, trimmed];
    });
    setSelectedUser(trimmed);
    setNewUserName('');
    cancelChanges();
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      {/*<img
        src={mainImage}
        alt="Main"
        className="pointer-events-none absolute left-6 top-6 h-40 w-auto opacity-90"
      />*/}

      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <UserSelector
          users={users}
          selectedUser={selectedUser}
          newUserName={newUserName}
          onSelectUser={handleUserChange}
          onNewUserNameChange={setNewUserName}
          onAddUser={onAddUser}
        />

        <div className="mt-10">
          <Calendar currentUser={selectedUser} users={users} />
        </div>
      </div>
    </main>
  );
}

export default App;
