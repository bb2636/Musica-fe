// src/components/TiptapEditor.tsx

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { uploadApi } from "../apis/uploadApi";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ value, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p>여기에 내용을 입력하세요!</p>",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // ✅ 이미지 삽입 핸들러
  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // 1. Presigned URL 요청
        const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl(
          file.name,
          file.type
        );

        // 2. 실제 업로드
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        // 3. 에디터에 이미지 삽입
        editor
          ?.chain()
          .focus()
          .insertContent(`<img src="${fileUrl}" alt="image" />`)
          .run();
      } catch (err) {
        console.error("이미지 업로드 실패", err);
        alert("이미지 업로드에 실패했습니다.");
      }
    };
  };

  if (!editor) return null;

  return (
    <div>
      {/* 툴바 */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
        >
          H2
        </button>
        <button onClick={handleImageUpload}>Image</button>
      </div>

      {/* 에디터 영역 */}
      <EditorContent
        editor={editor}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          minHeight: "200px",
        }}
      />
    </div>
  );
};

export default TiptapEditor;
