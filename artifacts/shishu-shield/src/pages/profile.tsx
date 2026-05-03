import React, { useState } from "react";
import { ChevronRight, LogOut, Plus, Trash2, Check, Baby, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language";
import { useChildren, ChildProfile } from "@/context/children";

const COMMON_CONDITIONS = [
  "Asthma", "Eczema", "Food Allergy", "Diabetes", "Heart Condition",
  "Epilepsy", "Anemia", "Malnutrition",
];

const AGE_OPTIONS = [
  "0–3 months", "3–6 months", "6–12 months",
  "1 year", "2 years", "3 years", "4 years", "5 years",
  "6–8 years", "9–12 years", "13+ years",
];

function Toggle({ on, onToggle, testId }: { on: boolean; onToggle: () => void; testId?: string }) {
  return (
    <button
      onClick={onToggle}
      data-testid={testId}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${on ? "bg-primary" : "bg-gray-200"}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

interface ChildFormData {
  name: string;
  age: string;
  gender: "boy" | "girl" | "other";
  conditions: string[];
}

function ChildForm({
  initial,
  onSave,
  onCancel,
  isBangla,
}: {
  initial?: ChildFormData;
  onSave: (data: ChildFormData) => void;
  onCancel: () => void;
  isBangla: boolean;
}) {
  const [form, setForm] = useState<ChildFormData>(
    initial ?? { name: "", age: "", gender: "boy", conditions: [] }
  );

  const toggleCondition = (c: string) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.includes(c)
        ? f.conditions.filter((x) => x !== c)
        : [...f.conditions, c],
    }));
  };

  const valid = form.name.trim().length > 0 && form.age.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="bg-white rounded-[16px] border border-border shadow-sm p-5 space-y-4"
    >
      {/* Name */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
          {isBangla ? "শিশুর নাম" : "Child's Name"}
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={isBangla ? "যেমন: রাফি, মিতু" : "e.g. Rafi, Mitu"}
          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          data-testid="input-child-name"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
          {isBangla ? "লিঙ্গ" : "Gender"}
        </label>
        <div className="flex gap-2">
          {(["boy", "girl", "other"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setForm((f) => ({ ...f, gender: g }))}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.gender === g
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 text-gray-600 border-border hover:border-primary"
              }`}
              data-testid={`btn-gender-${g}`}
            >
              {g === "boy"
                ? isBangla ? "ছেলে" : "Boy"
                : g === "girl"
                ? isBangla ? "মেয়ে" : "Girl"
                : isBangla ? "অন্য" : "Other"}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
          {isBangla ? "বয়স" : "Age"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AGE_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setForm((f) => ({ ...f, age: a }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.age === a
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 text-gray-600 border-border hover:border-primary"
              }`}
              data-testid={`btn-age-${a}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Known Conditions */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
          {isBangla ? "পরিচিত স্বাস্থ্য সমস্যা (ঐচ্ছিক)" : "Known Conditions (optional)"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleCondition(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                form.conditions.includes(c)
                  ? "bg-blue-50 text-primary border-primary"
                  : "bg-gray-50 text-gray-600 border-border hover:border-primary"
              }`}
              data-testid={`btn-condition-${c.toLowerCase().replace(/\s/g, "-")}`}
            >
              {form.conditions.includes(c) && <Check className="w-3 h-3" />}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          data-testid="btn-cancel-child"
        >
          {isBangla ? "বাতিল" : "Cancel"}
        </button>
        <button
          onClick={() => valid && onSave(form)}
          disabled={!valid}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-blue-600 transition-colors"
          data-testid="btn-save-child"
        >
          {isBangla ? "সংরক্ষণ করুন" : "Save"}
        </button>
      </div>
    </motion.div>
  );
}

function ChildCard({
  child,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  isBangla,
}: {
  child: ChildProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isBangla: boolean;
}) {
  const genderEmoji = child.gender === "boy" ? "👦" : child.gender === "girl" ? "👧" : "🧒";
  const genderLabel = child.gender === "boy"
    ? (isBangla ? "ছেলে" : "Boy")
    : child.gender === "girl"
    ? (isBangla ? "মেয়ে" : "Girl")
    : (isBangla ? "অন্য" : "Other");

  return (
    <motion.div
      layout
      className={`rounded-[16px] border transition-all cursor-pointer ${
        isActive
          ? "border-primary bg-blue-50 shadow-sm"
          : "border-border bg-white hover:border-blue-200"
      }`}
      onClick={onSelect}
      data-testid={`card-child-${child.id}`}
    >
      <div className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${isActive ? "bg-primary/10" : "bg-gray-100"}`}>
          {genderEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{child.name}</span>
            {isActive && (
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                {isBangla ? "সক্রিয়" : "ACTIVE"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {genderLabel} · {child.age}
          </p>
          {child.conditions.length > 0 && (
            <p className="text-xs text-amber-700 mt-0.5 truncate">
              ⚠️ {child.conditions.join(", ")}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors"
            data-testid={`btn-edit-child-${child.id}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            data-testid={`btn-delete-child-${child.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const { language, setLanguage, isBangla } = useLanguage();
  const { children, activeChildId, addChild, updateChild, removeChild, setActiveChild } = useChildren();
  const [voiceMode, setVoiceMode] = useState(true);
  const [lowData, setLowData] = useState(false);
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [doctorUpdates, setDoctorUpdates] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (data: { name: string; age: string; gender: "boy" | "girl" | "other"; conditions: string[] }) => {
    addChild(data);
    setShowAddForm(false);
  };

  const handleUpdate = (id: string, data: { name: string; age: string; gender: "boy" | "girl" | "other"; conditions: string[] }) => {
    updateChild(id, data);
    setEditingId(null);
  };

  return (
    <div className="px-4 pb-6 space-y-6">
      <header className="mt-2">
        <h1 className="text-xl font-bold text-foreground">
          {isBangla ? "আমার প্রোফাইল" : "My Profile"}
        </h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* ── Children Profiles ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isBangla ? "শিশুর প্রোফাইল" : "Children Profiles"}
            </h3>
            {!showAddForm && (
              <button
                onClick={() => { setShowAddForm(true); setEditingId(null); }}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                data-testid="btn-add-child"
              >
                <Plus className="w-3.5 h-3.5" />
                {isBangla ? "যোগ করুন" : "Add Child"}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {children.map((child) =>
                editingId === child.id ? (
                  <motion.div key={child.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ChildForm
                      initial={{ name: child.name, age: child.age, gender: child.gender, conditions: child.conditions }}
                      onSave={(data) => handleUpdate(child.id, data)}
                      onCancel={() => setEditingId(null)}
                      isBangla={isBangla}
                    />
                  </motion.div>
                ) : (
                  <ChildCard
                    key={child.id}
                    child={child}
                    isActive={activeChildId === child.id}
                    onSelect={() => setActiveChild(child.id)}
                    onEdit={() => { setEditingId(child.id); setShowAddForm(false); }}
                    onDelete={() => removeChild(child.id)}
                    isBangla={isBangla}
                  />
                )
              )}

              {showAddForm && (
                <ChildForm
                  key="add-form"
                  onSave={handleAdd}
                  onCancel={() => setShowAddForm(false)}
                  isBangla={isBangla}
                />
              )}
            </AnimatePresence>

            {children.length === 0 && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-8 rounded-[16px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                data-testid="btn-add-first-child"
              >
                <Baby className="w-7 h-7" />
                <span className="text-sm font-medium">
                  {isBangla ? "প্রথম শিশুর প্রোফাইল যোগ করুন" : "Add your first child's profile"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Preferences ── */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            {isBangla ? "পছন্দ" : "Preferences"}
          </h3>
          <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
            {/* Language toggle */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div>
                <span className="text-sm font-medium">{isBangla ? "ভাষা" : "Language"}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBangla ? "AI বাংলায় উত্তর দেবে" : "AI replies in English"}
                </p>
              </div>
              <button
                onClick={() => setLanguage(isBangla ? "en" : "bn")}
                data-testid="toggle-language"
                className={`relative flex items-center rounded-full border-2 transition-all duration-300 px-1 py-0.5 gap-1 ${
                  isBangla ? "bg-primary border-primary" : "bg-gray-100 border-gray-200"
                }`}
                style={{ width: 88, height: 32 }}
              >
                <span
                  className={`text-xs font-bold transition-all duration-300 ${isBangla ? "text-white" : "text-gray-400"}`}
                  style={{ width: 30, textAlign: "center" }}
                >বাং</span>
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 absolute ${
                    isBangla ? "translate-x-[52px]" : "translate-x-[2px]"
                  }`}
                />
                <span
                  className={`text-xs font-bold transition-all duration-300 ${isBangla ? "text-blue-200" : "text-primary"}`}
                  style={{ width: 30, textAlign: "center", marginLeft: "auto" }}
                >EN</span>
              </button>
            </div>
            <div className="flex justify-between items-center p-4 border-b border-border">
              <span className="text-sm font-medium">{isBangla ? "ভয়েস মোড" : "Voice Mode"}</span>
              <Toggle on={voiceMode} onToggle={() => setVoiceMode(!voiceMode)} testId="toggle-voice" />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-medium">{isBangla ? "কম ডেটা মোড" : "Low Data Mode"}</span>
              <Toggle on={lowData} onToggle={() => setLowData(!lowData)} testId="toggle-data" />
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            {isBangla ? "বিজ্ঞপ্তি" : "Notifications"}
          </h3>
          <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <span className="text-sm font-medium">{isBangla ? "স্বাস্থ্য সতর্কতা" : "Health Alerts"}</span>
              <Toggle on={healthAlerts} onToggle={() => setHealthAlerts(!healthAlerts)} testId="toggle-alerts" />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-medium">{isBangla ? "ডাক্তার আপডেট" : "Doctor Updates"}</span>
              <Toggle on={doctorUpdates} onToggle={() => setDoctorUpdates(!doctorUpdates)} testId="toggle-doctor-updates" />
            </div>
          </div>
        </div>

        {/* ── Account ── */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            {isBangla ? "অ্যাকাউন্ট" : "Account"}
          </h3>
          <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
            <button className="w-full flex justify-between items-center p-4 border-b border-border hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">{isBangla ? "গোপনীয়তা নীতি" : "Privacy Policy"}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full flex justify-between items-center p-4 border-b border-border hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">{isBangla ? "সাহায্য ও সহায়তা" : "Help & Support"}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">About SHISHU DOC</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <button
          className="w-full bg-white border border-red-400 text-red-600 font-bold text-sm py-3.5 rounded-[12px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          data-testid="btn-sign-out"
        >
          <LogOut className="w-4 h-4" />
          {isBangla ? "সাইন আউট" : "Sign Out"}
        </button>
      </motion.div>
    </div>
  );
}
