import { CheckSquare, Send, ShieldCheck, Square, Users } from "lucide-react";
import React, { useState } from "react";
import { errorText } from "../api";
import { ChecklistItem, GroupMessage } from "../types";
import { useSavedState, type Expense } from "../userState";

interface GroupMessagingProps {
  messages: GroupMessage[];
  isDarkMode: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

export const GroupMessaging: React.FC<GroupMessagingProps> = ({
  messages,
  onSendMessage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "chat" | "checklist" | "expenses"
  >("chat");
  const [inputText, setInputText] = useState("");

  const [checklists, setChecklists] = useSavedState("checklists");
  const checklist = checklists.items || [];
  const setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>> = (
    items,
  ) =>
    setChecklists((old) => ({
      ...old,
      items: typeof items === "function" ? items(old.items || []) : items,
    }));
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState("");

  // Group Expense Splitter State
  const expenses = checklists.expenses || [];
  const setExpenses = (expenses: Expense[]) =>
    setChecklists((old) => ({ ...old, expenses }));

  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPayer] = useState("Me");

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await onSendMessage(inputText);
      setInputText("");
    } catch (error) {
      setError(errorText(error));
    } finally {
      setSending(false);
    }
  };

  const addCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `c-${Date.now()}`,
        text: newCheckItem,
        completed: false,
        assignedTo: "Group",
      },
    ]);
    setNewCheckItem("");
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    setExpenses([
      ...expenses,
      {
        id: `e-${Date.now()}`,
        title: expTitle,
        amount: Number(expAmount),
        paidBy: expPayer,
        paxCount: 4,
      },
    ]);
    setExpTitle("");
    setExpAmount("");
  };

  const totalExpenseSum = expenses.reduce((sum, item) => sum + item.amount, 0);
  const perPersonShare = Math.round(totalExpenseSum / 4);

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="p-3 bg-rose-100 text-rose-900 rounded-xl">
          {error}
        </p>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Group Travel Messaging & Team Coordinator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Coordinate with your travel companions, local guides, share packing
            checklists, and split trip expenses seamlessly.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300 dark:border-white/15 backdrop-blur-md">
          {[
            { id: "chat", label: "Team Chat 💬" },
            { id: "checklist", label: "Trip Checklist 📋" },
            { id: "expenses", label: "Split Expenses 💰" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TEAM CHAT VIEW */}
      {activeSubTab === "chat" && (
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden text-slate-900 dark:text-white flex flex-col h-[520px] shadow-sm">
          {/* Group Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(46,196,182,0.4)]">
                SE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Sibale Island Expedition Crew
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-bold backdrop-blur-md">
                    Community Group
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300/80">
                  Messages from signed-in community members. Checklist and
                  expenses are your private trip notes.
                </p>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50 dark:bg-slate-950/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.isGuide ? "bg-teal-500/10 p-3 rounded-2xl border border-teal-500/30 backdrop-blur-md" : ""}`}>
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-teal-500/50"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold text-xs ${msg.isGuide ? "text-teal-800 dark:text-teal-300 flex items-center gap-1" : "text-slate-900 dark:text-white"}`}>
                      {msg.sender}{" "}
                      {msg.isGuide && (
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 inline" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendChat}
            className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md">
            <input
              type="text"
              placeholder="Send message to travel crew..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(46,196,182,0.4)]">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TRIP CHECKLIST VIEW */}
      {activeSubTab === "checklist" && (
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Shared Team Packing & Preparation Checklist
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {checklist.filter((c) => c.completed).length} of{" "}
              {checklist.length} Completed
            </span>
          </div>

          <form onSubmit={addCheckItem} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Add item (e.g. Reserve underwater camera)..."
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl shadow-[0_0_12px_rgba(46,196,182,0.4)] cursor-pointer">
              Add Item
            </button>
          </form>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setChecklist((prev) =>
                    prev.map((c) =>
                      c.id === item.id ? { ...c, completed: !c.completed } : c,
                    ),
                  )
                }
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors text-xs backdrop-blur-md ${
                  item.completed
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-950 dark:text-slate-300 line-through"
                    : "bg-slate-100/90 border-slate-200 text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                }`}>
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold">{item.text}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-bold">
                  Assigned: {item.assignedTo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPENSE SPLITTER VIEW */}
      {activeSubTab === "expenses" && (
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-6 shadow-sm">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Group Trip Expense Splitter
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Automatically splits banca charters, meals, and homestay costs
              equally among 4 crew members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-xs backdrop-blur-md">
              <span className="text-teal-900 dark:text-teal-300 block font-bold">
                Total Group Expense
              </span>
              <span className="text-2xl font-black text-teal-950 dark:text-teal-200">
                ₱{totalExpenseSum.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs backdrop-blur-md">
              <span className="text-amber-900 dark:text-amber-300 block font-bold">
                Per Person Share (4 pax)
              </span>
              <span className="text-2xl font-black text-amber-950 dark:text-amber-200">
                ₱{perPersonShare.toLocaleString()}
              </span>
            </div>
          </div>

          <form
            onSubmit={addExpense}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              placeholder="Expense title (e.g. Seafood Dinner)"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
            <input
              type="number"
              placeholder="Amount (PHP)"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl shadow-[0_0_12px_rgba(46,196,182,0.4)] cursor-pointer">
              Add Shared Expense
            </button>
          </form>

          <div className="space-y-2">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {e.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300/80 text-[11px]">
                    Paid upfront by {e.paidBy}
                  </p>
                </div>
                <span className="font-extrabold text-teal-800 dark:text-teal-300 text-sm">
                  ₱{e.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
