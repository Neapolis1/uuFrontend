import React, { useEffect, useState } from "react";
import "./ShoppingListDetail.css";
import shoppingListsMock from "./mock-data.js";
import { useUser, getUserNameById, USERS } from "./user";

function ShoppingListDetail() {
  const currentUser = useUser();
  const [lists] = useState(shoppingListsMock);
  const [selectedId, setSelectedId] = useState(lists[0]?.id ?? null);
  const [list, setList] = useState(null);

  // lokalní stavy pro editaci názvu
  const [editingName, setEditingName] = useState(false);
  const [editableName, setEditableName] = useState("");

  // add item lokálně
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // per-item edit/delete
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");

  // modal pro členy
  const [showMembers, setShowMembers] = useState(false);
  // modal pro přidání člena
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");

  useEffect(() => {
    const found = lists.find(l => l.id === selectedId) ?? null;
    // vytvoříme clone objektu, aby se neměnil originální mock
    setList(found ? { ...found, items: found.items ? [...found.items] : [] } : null);
  }, [lists, selectedId]);

  // synchronizace editableName s aktuálním seznamem
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
    // změna pouze lokálně v komponentě
    setList(prev => ({ ...prev, name: editableName }));
    setEditingName(false);
  };

  const onCancelRename = () => {
    setEditableName(list.name);
    setEditingName(false);
  };

  // archivace mění jen lokální stav komponenty (mock soubor zůstává nezměněn)
  const onArchive = () => {
    setList(prev => ({ ...prev, archived: true }));
  };

  // ADD ITEM - lokálně (stejně jako rename)
  const onStartAddItem = () => {
    setNewItemName("");
    setAddingItem(true);
  };

  const onSaveAddItem = () => {
    const name = (newItemName || "").trim();
    if (!name) return;
    setList(prev => {
      const items = Array.isArray(prev.items) ? [...prev.items] : [];
      // jednoduché id generování: max id + 1 (fallback to timestamp)
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

  // per-item edit handlers
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
    // if we were editing this item, reset edit state
    if (editingItemId === id) {
      setEditingItemId(null);
      setEditingItemName("");
    }
  };

  const onOpenMembers = () => setShowMembers(true);
  const onCloseMembers = () => setShowMembers(false);

  const onOpenAddMember = () => {
    // před otevřením nastavíme defaultní hodnotu selectu
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

  // leave pro členy (lokálně) — odebere aktuálního uživatele z members
  const onLeave = () => {
    setList(prev => {
      const members = Array.isArray(prev.members) ? prev.members.filter(m => m !== currentUser.id) : [];
      return { ...prev, members };
    });
    // zavřeme modal members pokud byl otevřený
    setShowMembers(false);
  };

  const renderMemberLabel = (id) => {
    if (!id) return id;
    if (id === currentUser.id) return `${currentUser.name} (you)`;
    // použijeme lookup pro jméno
    return getUserNameById(id);
  };

  return (
    <div className="shopping-wrapper">

      {/* list selector */}
      <div style={{ padding: 8 }}>
        <label style={{ marginRight: 8 }}>Select list:</label>
        <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))}>
          {lists.map(l => (
            <option key={l.id} value={l.id}>
              {l.name}{l.archived ? " (archived)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* pokud uživatel nemá přístup k vybranému seznamu */}
      {!hasAccess ? (
        <div style={{ padding: 20, color: "#b00" }}>
          Tento obsah není dostupný.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="shopping-header">
            {editingName ? (
              <input
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                style={{ fontSize: 24, padding: "6px 8px" }}
              />
            ) : (
              <h1>{list.name}</h1>
            )}

            {/* show rename/archive only for owner and only when not archived */}
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

          {/* pokud je seznam archivovaný, zobrazíme jen zprávu */}
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
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="New item name"
                        style={{ padding: "6px 8px", flex: "1 0 auto", marginRight: 8 }}
                      />
                      <button onClick={onSaveAddItem} disabled={!newItemName.trim()}>ADD</button>
                      <button onClick={onCancelAddItem}>CANCEL</button>
                    </>
                  ) : (
                    // zobrazíme tlačítko pro spuštění přidání pokud má uživatel přístup
                    hasAccess && <button className="add-item-btn" onClick={onStartAddItem}>ADD ITEM</button>
                  )}
                </div>

                {activeItems.map(item => (
                  <div className="item-row" key={item.id}>
                    <span className="item-checkbox"></span>

                    {editingItemId === item.id ? (
                      <>
                        <input
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          style={{ padding: "6px 8px", flex: "1 0 auto", marginRight: 8 }}
                        />
                        <button onClick={onSaveEditItem} disabled={!editingItemName.trim()}>SAVE</button>
                        <button onClick={onCancelEditItem}>CANCEL</button>
                      </>
                    ) : (
                      <>
                        <span className="item-name" style={{ flex: 1 }}>{item.name}</span>
                        {/* edit/delete only if user has access and list is not archived */}
                        {hasAccess && !list.archived && (
                          <>
                            <span className="item-edit" style={{ cursor: "pointer", opacity: 0.8, marginRight: 8 }} onClick={() => onStartEditItem(item)}>✎</span>
                            <span className="item-delete" style={{ cursor: "pointer", opacity: 0.8 }} onClick={() => onDeleteItem(item.id)}>🗑</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}

                <div className="separator"></div>

                {archivedItems.map(item => (
                  <div className="item-row archived" key={item.id}>
                    <span className="item-checkbox disabled"></span>
                    <span className="item-name crossed">{item.name}</span>
                    {/* disabled delete icon for archived items (no onClick) */}
                    <span className="item-delete" style={{ opacity: 0.4, cursor: "default" }} onClick={() => onDeleteItem(item.id)}>🗑</span>
                  </div>
                ))}
              </div>

              {/* Bottom buttons */}
              <div className="bottom-bar">
                {isOwner ? (
                  <button className="bottom-btn" onClick={onOpenAddMember}>ADD MEMBER</button>
                ) : (
                  <button className="bottom-btn" onClick={onLeave}>LEAVE</button>
                )}
                <button className="bottom-btn" onClick={onOpenMembers}>MEMBER LIST</button>
              </div>
            </>
          )}
        </>
      )}

      {/* Members modal */}
      {showMembers && (
        <div
          onClick={onCloseMembers}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 320,
              maxWidth: "90%"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong>Members</strong>
              <button onClick={onCloseMembers} style={{ cursor: "pointer" }}>Close</button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div><strong>Owner:</strong> {list.ownerId === currentUser.id ? `${currentUser.name} (you)` : getUserNameById(list.ownerId)}</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Members:</div>
              {Array.isArray(list.members) && list.members.length > 0 ? (
                <ul style={{ paddingLeft: 20, marginTop: 0 }}>
                  {list.members.map(mid => (
                    <li key={mid}>{renderMemberLabel(mid)}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No members</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add member modal (lokální změna, mock zůstává nezměněn) */}
      {showAddMember && (
        <div
          onClick={onCloseAddMember}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 360,
              maxWidth: "90%"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong>Add member</strong>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 8 }}>Select user to add:</label>
              <select value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} style={{ width: "100%", padding: 8 }}>
                {USERS
                  .filter(u => u.id !== list.ownerId && !(list.members || []).includes(u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))
                }
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={onCloseAddMember}>Cancel</button>
              <button onClick={onConfirmAddMember} disabled={!newMemberId}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingListDetail;