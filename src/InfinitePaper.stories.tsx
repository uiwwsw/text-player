import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import { InfinitePaper, useInfinitePaper } from "./index";

interface StoryItem {
  id: string;
  title: string;
  content: string;
}

const meta: Meta<typeof InfinitePaper<StoryItem>> = {
  title: "Components/InfinitePaper",
  component: InfinitePaper,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof InfinitePaper<StoryItem>>;

const makeLoader = (pageSize: number) => {
  const totalPages = 3;
  return async (page: number) => {
    const start = (page - 1) * pageSize;
    const items: StoryItem[] = Array.from({ length: pageSize }, (_, idx) => ({
      id: `story-${page}-${idx}`,
      title: `노트 ${start + idx + 1}`,
      content: `이 컨텐츠는 가상의 데이터로 생성된 노트 ${start + idx + 1} 입니다.`,
    }));

    return Promise.resolve({ items, totalPages, hasMore: page < totalPages });
  };
};

function Example(args: { pageSize: number }) {
  const loadPage = useMemo(() => makeLoader(args.pageSize), [args.pageSize]);
  const paper = useInfinitePaper<StoryItem>({ loadPage, pageSize: args.pageSize });

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <InfinitePaper
        paper={paper}
        renderItem={(item) => (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <div style={{ fontWeight: 700 }}>{item.title}</div>
            <p style={{ color: "#374151" }}>{item.content}</p>
          </div>
        )}
        loader={<p style={{ color: "#6b7280" }}>스토리북 로딩 중...</p>}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    pageSize: 4,
  },
  render: args => <Example {...args} />,
};
