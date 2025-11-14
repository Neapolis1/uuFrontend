import React from "react";
import { useState } from "react";

const USERS = [
  { id: "123", name: "James" },
  { id: "234", name: "Amelia" },
  { id: "345", name: "John" },
  { id: "456", name: "Chloe" },
];

// in pure react
const UserContext = React.createContext();
const useUserContext = () => React.useContext(UserContext);

function UserProvider({ children }) {
  const userParams = useState(USERS[0]);

  return (
    <UserContext.Provider value={userParams}>
      {children}
    </UserContext.Provider>
  );
}

function UserSelector() {
  const [user, setUser] = useUserContext();

  return (
    <select value={user.id} onChange={(e) => setUser(USERS.find(({ id }) => id === e.target.value))}>
      {USERS.map(({ id, name }) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </select>
  );
}

function useUser() {
  return useUserContext()[0];
}

/*
* Usage:
* ------
* <UserProvider>
*   ...
*     <UserSelector />
*   ...
*     <SomeComponent />
* </UserProvider>
*
* function SomeComponent() {
*   const user = useUser();
*   return ...;
* }
* */

export { UserProvider, UserSelector, useUser };
