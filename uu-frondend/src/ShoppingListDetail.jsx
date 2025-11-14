import React, { useEffect, useState } from "react";
import "./ShoppingListDetail.css";
import shoppingListsMock from "./mock-data.js";
import { useUser } from "./user";

function ShoppingListDetail() {
  const currentUser = useUser();
  const [lists] = useState(shoppingListsMock);
  const [selectedId, setSelectedId] = useState(lists[0]?.id ?? null);
  const [list, setList] = useState(null);

  useEffect(() => {
    const found = lists.find(l => l.id === selectedId) ?? null;
    setList(found);
  }, [lists, selectedId]);

  if (!list) return <div className="shopping-wrapper">Loading…</div>;

  const activeItems = list.items.filter(i => !i.archived);
  const archivedItems = list.items.filter(i => i.archived);
  const isOwner = currentUser && currentUser.id === list.ownerId;
  const ownerLabel = isOwner ? "OWNER" : "MEMBER";

  return (
    <div className="shopping-wrapper">

      {/* Header */}
      <div className="shopping-header">
        <h1>{list.name}</h1>

        {/* show rename/archive only for owner */}
        {isOwner && (
          <>
            <button>RENAME LIST</button>
            <button>ARCHIVE LIST</button>
          </>
        )}

        <span className="owned">{ownerLabel}</span>
      </div>

      {/* Items */}
      <div className="items-container">
        
        {/* Add item button (skrytý pokud je celý seznam archivovaný) */}
        {!list.archived && (
          <div className="add-item-row">
            <span className="add-icon">+</span>
            <button className="add-item-btn">ADD ITEM</button>
          </div>
        )}

        {activeItems.map(item => (
          <div className="item-row" key={item.id}>
            <span className="item-checkbox"></span>
            <span className="item-name">{item.name}</span>
            <span className="item-edit">✎</span>
            <span className="item-delete">🗑</span>
          </div>
        ))}

        <div className="separator"></div>

        {archivedItems.map(item => (
          <div className="item-row archived" key={item.id}>
            <span className="item-checkbox disabled"></span>
            <span className="item-name crossed">{item.name}</span>
            <span className="item-delete">🗑</span>
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="bottom-bar">
        {/* owner může přidávat členy, member vidí Leave */}
        {isOwner ? (
          <button className="bottom-btn">ADD MEMBER</button>
        ) : (
          <button className="bottom-btn">LEAVE</button>
        )}
        <button className="bottom-btn">MEMBER LIST</button>
      </div>

    </div>
  );
}

export default ShoppingListDetail;