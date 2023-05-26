import { Box } from "@mui/material";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { CodeBlock } from "./CodeBlock";

export const ChatMessage: React.FC<{
  message: {
    role: "assistant" | "user";
    content: string;
  };
}> = ({ message }) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor:
          message.role === "assistant" ? "rgba(66,72,87, 0.5)" : undefined,
      }}
    >
      <Box
        sx={{
          maxWidth: "768px",
          margin: "0 auto",
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");

              return !inline ? (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};
