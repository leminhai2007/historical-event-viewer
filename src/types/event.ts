import { MDXRemoteSerializeResult } from "next-mdx-remote";

export interface EventTags {
  region: string[];
  people?: string[];
}

export interface EventMetadata {
  title: string;
  date: string;
  icon?: string;
  image?: string;
  tags: EventTags;
}

export interface Event {
  slug: string;
  filename: string;
  metadata: EventMetadata;
  content: string;
}

export interface ProcessedEvent extends Event {
  parsedDate: Date;
  displayDate: string;
  serializedContent: MDXRemoteSerializeResult;
}
