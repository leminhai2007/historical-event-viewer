export const UI_STRINGS: Record<string, Record<string, string>> = {
  vi: {
    "app.title": "Quan Sát Sự Kiện Lịch Sử",
    "app.tagline": "Khám phá các sự kiện lịch sử trên dòng thời gian tương tác",
    "subtitle.events": "Đang xem {n} sự kiện",
    "subtitle.regions": " tại {regions}",
    "regions.title": "Khu vực",
    "regions.search": "Tìm kiếm khu vực...",
    "regions.none": "Không có khu vực nào",
    "regions.noMatch": "Không có khu vực khớp \u201c{q}\u201d",
    "regions.selectAll": "Chọn tất cả",
    "regions.reset": "Đặt lại về {region}",
    "regions.open": "Mở bộ lọc khu vực",
    "regions.close": "Đóng bảng",
    "regions.people": "Nhân vật:",
    "tooltip.close": "Đóng",
    "card.alternate": "",
    "install.title": "Cài đặt ứng dụng",
    "empty.title": "Không có sự kiện nào",
    "empty.body": "Thử chọn các khu vực khác",
    "date.unknown": "Ngày không rõ",
    "date.bce": "TCN",
    "footer.contribute": "Đóng góp nội dung trên GitHub",
    "footer.language": "Ngôn ngữ",
  },
  en: {
    "app.title": "Historical Event Viewer",
    "app.tagline": "Explore historical events in an interactive timeline",
    "subtitle.events": "Exploring {n} events",
    "subtitle.regions": " in {regions}",
    "regions.title": "Regions",
    "regions.search": "Search regions...",
    "regions.none": "No regions available",
    "regions.noMatch": "No regions match \u201c{q}\u201d",
    "regions.selectAll": "Select All",
    "regions.reset": "Reset to {region}",
    "regions.open": "Open region filter",
    "regions.close": "Close panel",
    "regions.people": "People:",
    "tooltip.close": "Close",
    "card.alternate": "",
    "install.title": "Install App",
    "empty.title": "No events found",
    "empty.body": "Try selecting different regions",
    "date.unknown": "Unknown Date",
    "date.bce": "BCE",
    "footer.contribute": "Contribute content on GitHub",
    "footer.language": "Language",
  },
};

export function getStrings(locale: string): Record<string, string> {
  return UI_STRINGS[locale] ?? UI_STRINGS.en ?? {};
}

export function template(
  str: string,
  values: Record<string, string | number>
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}