import React, { useEffect, useState } from "react";
import "./ShoppingListDetail.css";
import shoppingListsMock from "./mock-data.js";
import { useUser, getUserNameById, USERS } from "./user.js";

function ShoppingListDetail() {
  const currentUser = useUser();
  const [lists] = useState(shoppingListsMock);
  const [selectedId, setSelectedId] = useState(lists[0]?.id ?? null);
  const [list, setList] = useState(null);

  const [editingName, setEditingName] = useState(false);
  const [editableName, setEditableName] = useState("");

  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");

  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");

  useEffect(() => {
    const found = lists.find(l => l.id === selectedId) ?? null;
    setList(found ? { ...found, items: found.items ? [...found.items] : [] } : null);
  }, [lists, selectedId]);

  useEffect(() => {
    if (list) {
      setEditableName(list.name);
      setEditingName(false);
      setAddingItem(false);
      setNewItemName("");
      setEditingItemId(null);
      setEditingItemName("");
    } else {
      setEditableName("");
      setEditingName(false);
      setAddingItem(false);
      setNewItemName("");
      setEditingItemId(null);
      setEditingItemName("");
    }
  }, [list]);

  if (!currentUser) return <div className="shopping-wrapper">Loading…</div>;
  if (!list) return <div className="shopping-wrapper">Loading…</div>;

  const activeItems = Array.isArray(list.items) ? list.items.filter(i => !i.archived) : [];
  const archivedItems = Array.isArray(list.items) ? list.items.filter(i => i.archived) : [];
  const isOwner = currentUser && currentUser.id === list.ownerId;
  const isMember = Array.isArray(list.members) && list.members.includes(currentUser.id);
  const hasAccess = isOwner || isMember;
  const ownerLabel = isOwner ? "OWNER" : "MEMBER";

  const onStartRename = () => {
    setEditableName(list.name);
    setEditingName(true);
  };

  const onSaveRename = () => {
    setList(prev => ({ ...prev, name: editableName }));
    setEditingName(false);
  };

  const onCancelRename = () => {
    setEditableName(list.name);
    setEditingName(false);
  };

  const onArchive = () => {
    setList(prev => ({ ...prev, archived: true }));
  };

  // ADD ITEM 
  const onStartAddItem = () => {
    setNewItemName("");
    setAddingItem(true);
  };

  const onSaveAddItem = () => {
    const name = (newItemName || "").trim();
    if (!name) return;
    setList(prev => {
      const items = Array.isArray(prev.items) ? [...prev.items] : [];
      const maxId = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
      const nextId = maxId ? maxId + 1 : Date.now();
      const newItem = { id: nextId, name, archived: false };
      return { ...prev, items: [...items, newItem] };
    });
    setAddingItem(false);
    setNewItemName("");
  };

  const onCancelAddItem = () => {
    setAddingItem(false);
    setNewItemName("");
  };

  const onStartEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const onSaveEditItem = () => {
    const name = (editingItemName || "").trim();
    if (!name) return;
    setList(prev => {
      const items = Array.isArray(prev.items) ? prev.items.map(it => it.id === editingItemId ? { ...it, name } : it) : prev.items;
      return { ...prev, items };
    });
    setEditingItemId(null);
    setEditingItemName("");
  };

  const onCancelEditItem = () => {
    setEditingItemId(null);
    setEditingItemName("");
  };

  const onDeleteItem = (id) => {
    setList(prev => {
      const items = Array.isArray(prev.items) ? prev.items.filter(it => it.id !== id) : [];
      return { ...prev, items };
    });
    if (editingItemId === id) {
      setEditingItemId(null);
      setEditingItemName("");
    }
  };

  // toggle archive/unarchive for an item 
  const onToggleItemArchived = (id) => {
    setList(prev => {
      const items = Array.isArray(prev.items)
        ? prev.items.map(it => it.id === id ? { ...it, archived: !it.archived } : it)
        : prev.items;
      return { ...prev, items };
    });
  };

  const onOpenMembers = () => setShowMembers(true);
  const onCloseMembers = () => setShowMembers(false);

  // add member
  const onOpenAddMember = () => {
    const available = USERS.filter(u => u.id !== list.ownerId && !(list.members || []).includes(u.id));
    setNewMemberId(available[0]?.id ?? "");
    setShowAddMember(true);
  };
  const onCloseAddMember = () => setShowAddMember(false);

  const onConfirmAddMember = () => {
    if (!newMemberId) return;
    setList(prev => {
      const members = Array.isArray(prev.members) ? [...prev.members] : [];
      if (members.includes(newMemberId)) return prev;
      return { ...prev, members: [...members, newMemberId] };
    });
    setShowAddMember(false);
  };

  // remove member (only for owner)
  const onRemoveMember = (memberId) => {
    if (!isOwner) return;
    setList(prev => {
      const members = Array.isArray(prev.members) ? prev.members.filter(m => m !== memberId) : [];
      return { ...prev, members };
    });
  };

  // leave list (for members)
  const onLeave = () => {
    setList(prev => {
      const members = Array.isArray(prev.members) ? prev.members.filter(m => m !== currentUser.id) : [];
      return { ...prev, members };
    });
  };

  const renderMemberLabel = (id) => {
    if (!id) return id;
    if (id === currentUser.id) return `${currentUser.name} (you)`;
    return getUserNameById(id);
  };

  return (
    <div className="shopping-wrapper">

      {/* list selector */}
      {/* <div className="select-row">
        <label className="select-label">Select list:</label>
        <select className="select-input" value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))}>
           {lists.map(l => (
             <option key={l.id} value={l.id}>
               {l.name}{l.archived ? " (archived)" : ""}
             </option>
           ))}
         </select>
       </div> */}
 
       {/* if user dont have permision to this list */}
      {!hasAccess ? (
        <div className="not-available">
          Tento obsah není dostupný.
        </div>
      ) : (
         <>
           {/* Header */}
           <div className="shopping-header">
            {editingName ? (
              <input
                className="header-input"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
              />
            ) : (
              <h1>{list.name}</h1>
            )}

            {/* show rename/archive only for owner */}
            {isOwner && !list.archived && (
               <>
                 {!editingName ? (
                   <button onClick={onStartRename}>RENAME LIST</button>
                 ) : (
                   <>
                     <button onClick={onSaveRename}>SAVE</button>
                     <button onClick={onCancelRename}>CANCEL</button>
                   </>
                 )}
                 <button onClick={onArchive}>ARCHIVE LIST</button>
               </>
             )}
 
             <span className="owned">{ownerLabel}</span>
           </div>
 
           {/* message when is list is archived */}
           {list.archived ? (
            <div style={{ padding: "16px 20px", color: "#555" }}>
              Tento seznam je archivovaný.
            </div>
           ) : (
             <>
               {/* Items */}
               <div className="items-container">
                <div className="add-item-row">
                  <span className="add-icon">+</span>
                  {addingItem ? (
                    <>
                      <input
                        className="add-input"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="New item name"
                      />
                      <div className="add-actions">
                        <button onClick={onSaveAddItem} disabled={!newItemName.trim()}>ADD</button>
                        <button onClick={onCancelAddItem}>CANCEL</button>
                      </div>
                    </>
                  ) : (
                    hasAccess && <button className="add-item-btn" onClick={onStartAddItem}>ADD ITEM</button>
                  )}
                </div>
 
                 {activeItems.map(item => (
                   <div className="item-row" key={item.id}>
                     <span
                       className={`item-checkbox`}
                       onClick={() => hasAccess && onToggleItemArchived(item.id)}
                       title={hasAccess ? "Archive item" : ""}
                     />
 
                     {editingItemId === item.id ? (
                       <>
                         <input
                           className="add-input"
                           value={editingItemName}
                           onChange={(e) => setEditingItemName(e.target.value)}
                         />
                         <div className="add-actions">
                           <button onClick={onSaveEditItem} disabled={!editingItemName.trim()}>SAVE</button>
                           <button onClick={onCancelEditItem}>CANCEL</button>
                         </div>
                       </>
                     ) : (
                       <>
                         <span className="item-name">{item.name}</span>
                         {hasAccess && !list.archived && (
                           <>
                             <span className="item-edit" onClick={() => onStartEditItem(item)}>✎</span>
                             <span className="item-delete" onClick={() => onDeleteItem(item.id)}>🗑</span>
                           </>
                         )}
                       </>
                     )}
                   </div>
                 ))}
 
                 <div className="separator"></div>
 
                {archivedItems.map(item => (
                  <div className="item-row archived" key={item.id}>
                    <span
                      className={`item-checkbox disabled checked`}
                      onClick={() => hasAccess && onToggleItemArchived(item.id)}
                      title={hasAccess ? "Unarchive item" : ""}
                    />

                    <span className="item-name crossed">{item.name}</span>
                    <span className="item-delete" onClick={() => onDeleteItem(item.id)}>🗑</span>
                    </div>
                ))}
               </div>
 
               {/* Bottom buttons */}
               <div className="bottom-bar">
                 {isOwner ? (
                   <button onClick={onOpenAddMember}>ADD MEMBER</button>
                 ) : (
                   <button onClick={onLeave}>LEAVE</button>
                 )}
                 <button onClick={onOpenMembers}>MEMBER LIST</button>
               </div>
             </>
           )}
         </>
       )}
 
      {/* Members modal */}
      {showMembers && (
        <div className="modal-backdrop" onClick={onCloseMembers}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <strong>Members</strong>
              <button className="modal-close-btn" onClick={onCloseMembers}>Close</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 8 }}>
                <div><strong>Owner:</strong> {list.ownerId === currentUser.id ? `${currentUser.name} (you)` : getUserNameById(list.ownerId)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Members:</div>
                {Array.isArray(list.members) && list.members.length > 0 ? (
                  <ul className="modal-list">
                    {list.members.map(mid => (
                      <li key={mid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{renderMemberLabel(mid)}</span>
                        {isOwner && mid !== list.ownerId ? (
                          <button onClick={() => onRemoveMember(mid)}>Remove</button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: "#666" }}>No members</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
 
      {showAddMember && (
        <div className="modal-backdrop" onClick={onCloseAddMember}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <strong>Add member</strong>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 8 }}>Select user to add:</label>
                <select className="select-input" value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)}>
                  {USERS
                    .filter(u => u.id !== list.ownerId && !(list.members || []).includes(u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="add-actions">
                <button onClick={onCloseAddMember}>Cancel</button>
                <button onClick={onConfirmAddMember} disabled={!newMemberId}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingListDetail;