import re

with open('apps/admin/src/components/AboutWysiwygEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update EditableText component to have an obvious editable appearance:
old_editable_text = """function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Type here...',
  multiline = false,
  rows = 2,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const common = `hover:ring-1 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 rounded px-1 -mx-1 transition-all outline-none bg-transparent ${className}`;

  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${common} w-full resize-none block`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${common} w-full`}
    />
  );
}"""

new_editable_text = """function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  rows = 2,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const common = `transition-all outline-none rounded px-1.5 py-0.5 -mx-1 border border-dashed border-white/20 hover:border-indigo-400/80 hover:bg-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-500/15 focus:ring-1 focus:ring-indigo-500/50 cursor-text ${className}`;

  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${common} w-full resize-y block`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${common} w-full`}
    />
  );
}"""

assert old_editable_text in content, "old_editable_text not found"
content = content.replace(old_editable_text, new_editable_text)

# 2. Update EditablePhoto component:
old_editable_photo = """function EditablePhoto({
  src,
  alt = '',
  onPick,
  className = '',
}: {
  src: string;
  alt?: string;
  onPick: () => void;
  className?: string;
}) {
  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
      <button
        type="button"
        onClick={onPick}
        className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-white/20 cursor-pointer"
        title="Change photo"
      >
        <Camera size={13} />
        <span>Change Photo</span>
      </button>
    </div>
  );
}"""

new_editable_photo = """function EditablePhoto({
  src,
  alt = '',
  onPick,
  className = '',
}: {
  src: string;
  alt?: string;
  onPick: () => void;
  className?: string;
}) {
  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
      <button
        type="button"
        onClick={onPick}
        className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-indigo-600 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-xl border border-white/25 cursor-pointer opacity-90 group-hover:opacity-100 transition-all"
        title="Change photo"
      >
        <Camera size={13} />
        <span>Change Photo</span>
      </button>
    </div>
  );
}"""

assert old_editable_photo in content, "old_editable_photo not found"
content = content.replace(old_editable_photo, new_editable_photo)

with open('apps/admin/src/components/AboutWysiwygEditor.tsx', 'w') as f:
    f.write(content)

print("EditableText and EditablePhoto updated successfully.")
