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

  // modal pro členy
  const [showMembers, setShowMembers] = useState(false);
  // modal pro přidání člena
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");

  useEffect(() => {
    const found = lists.find(l => l.id === selectedId) ?? null;
    // vytvoříme clone objektu, aby se neměnil originální mock
    setList(found ? { ...found } : null);
  }, [lists, selectedId]);

  // synchronizace editableName s aktuálním seznamem
  useEffect(() => {
    if (list) {
      setEditableName(list.name);
      setEditingName(false);
    } else {
      setEditableName("");
      setEditingName(false);
    }
  }, [list]);

  if (!currentUser) return <div className="shopping-wrapper">Loading…</div>;
  if (!list) return <div className="shopping-wrapper">Loading…</div>;

  const activeItems = list.items.filter(i => !i.archived);
  const archivedItems = list.items.filter(i => i.archived);
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
                  <button className="add-item-btn">ADD ITEM</button>
                </div>

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