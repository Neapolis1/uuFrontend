const shoppingListsMock = [
  {
    id: 1,
    name: "Food",
    ownerId: "123", // James
    archived: false,
    members: ["234"], // Amelia
    items: [
      { id: 1, name: "Milk", archived: false },
      { id: 2, name: "Bread", archived: false },
      { id: 3, name: "Eggs", archived: false },
      { id: 4, name: "Butter", archived: false },
      { id: 5, name: "Cheese", archived: true }
    ]
  },
  {
    id: 2,
    name: "Office supplies",
    ownerId: "234", // Amelia
    archived: false,
    members: [],
    items: [
      { id: 11, name: "Printer paper", archived: false },
      { id: 12, name: "Pens", archived: false },
      { id: 13, name: "Stapler", archived: false }
    ]
  },
  {
    id: 3,
    name: "Old party list (archived)",
    ownerId: "345", // John
    archived: true, 
    members: ["123"], // James
    items: [
      { id: 21, name: "Balloons", archived: true },
      { id: 22, name: "Soda", archived: true },
      { id: 23, name: "Cake", archived: true }
    ]
  }
];

export default shoppingListsMock;