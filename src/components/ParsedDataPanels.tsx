import { Chunk, Element } from "@/types/types";

/**
 * Renders unstructured parse chunks in a grouped, readable layout.
 */
export function extractReadableText(data: Chunk[] = []) {
  if (!data) return <p>No content to display.</p>;

  const contentArray = data.flatMap((chunk) => chunk.content || []);
  if (contentArray.length === 0)
    return <p>No readable content found in the file.</p>;

  const groupedContent = contentArray.reduce(
    (acc, item) => {
      const parentId = item.metadata.parent_id || "root";
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(item);
      return acc;
    },
    {} as Record<string, Element[]>
  );

  return Object.keys(groupedContent).map((parentId) => {
    const elements = groupedContent[parentId];
    return (
      <div key={parentId} className="grouped-content">
        {elements.map((item) => {
          switch (item.type) {
            case "Title":
            case "NarrativeText":
              return (
                <div key={item.element_id} className="mb-2">
                  <strong>{item.type}:</strong> {item.text}
                </div>
              );

            case "UncategorizedText":
              if (/^\d+$/.test(item.text || "")) {
                return null;
              }
              return (
                <div key={item.element_id} className="mb-2 text-gray-500">
                  <strong>Uncategorized:</strong> {item.text}
                </div>
              );

            case "Header":
            case "Footer":
              return (
                <div key={item.element_id} className="mb-2 font-bold text-lg">
                  {item.text} ({item.type})
                </div>
              );

            case "PageNumber":
              return (
                <div key={item.element_id} className="mb-2">
                  <strong>Page:</strong> {item.text}
                </div>
              );

            case "Image":
              return (
                <div key={item.element_id} className="mb-2">
                  <strong>Image:</strong> {item.text || "No descriptive text"}
                </div>
              );

            default:
              return (
                <div key={item.element_id} className="mb-2">
                  <strong>{item.type}:</strong> {item.text || "N/A"}
                </div>
              );
          }
        })}
      </div>
    );
  });
}
