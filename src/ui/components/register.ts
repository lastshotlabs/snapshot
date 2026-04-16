/**
 * Built-in config-driven components and their schemas.
 *
 * The bootstrap layer registers these explicitly so importing the UI package
 * stays side-effect free.
 */
import { registerComponent } from "../manifest/component-registry";
import { registerComponentSchema } from "../manifest/schema";
import { StatCard, statCardConfigSchema } from "./data/stat-card/index";
import { DataTable } from "./data/data-table/index";
import { dataTableConfigSchema } from "./data/data-table/schema";
import { AutoForm } from "./forms/auto-form/index";
import { autoFormConfigSchema } from "./forms/auto-form/schema";
import { Button, buttonConfigSchema } from "./forms/button/index";
import { ModalComponent, modalConfigSchema } from "./overlay/modal";
import { DrawerComponent, drawerConfigSchema } from "./overlay/drawer";
import { DetailCard } from "./data/detail-card/index";
import { detailCardConfigSchema } from "./data/detail-card/schema";
import { TabsComponent, tabsConfigSchema } from "./navigation/tabs";
import { Badge, badgeConfigSchema } from "./data/badge/index";
import { Avatar, avatarConfigSchema } from "./data/avatar/index";
import { Alert, alertConfigSchema } from "./data/alert/index";
import { Progress, progressConfigSchema } from "./data/progress/index";
import { Skeleton, skeletonConfigSchema } from "./data/skeleton/index";
import { Switch, switchConfigSchema } from "./forms/switch/index";
import { EmptyState, emptyStateConfigSchema } from "./data/empty-state/index";
import {
  AccordionComponent,
  accordionConfigSchema,
} from "./navigation/accordion/index";
import {
  BreadcrumbComponent,
  breadcrumbConfigSchema,
} from "./navigation/breadcrumb/index";
import { ListComponent, listConfigSchema } from "./data/list/index";
import { TooltipComponent, tooltipConfigSchema } from "./data/tooltip/index";
import { Timeline, timelineConfigSchema } from "./content/timeline/index";
import { CodeBlock, codeBlockConfigSchema } from "./content/code-block/index";
import { Stepper, stepperConfigSchema } from "./navigation/stepper/index";
import { TreeView, treeViewConfigSchema } from "./navigation/tree-view/index";
import { Kanban, kanbanConfigSchema } from "./workflow/kanban/index";
import { Calendar, calendarConfigSchema } from "./workflow/calendar/index";
import { AuditLog, auditLogConfigSchema } from "./workflow/audit-log/index";
import {
  NotificationFeed,
  notificationFeedConfigSchema,
} from "./workflow/notification-feed/index";
import { Code, codeConfigSchema } from "./content/code/index";
import { Heading, headingConfigSchema } from "./content/heading/index";
import {
  DropdownMenu,
  dropdownMenuConfigSchema,
} from "./overlay/dropdown-menu/index";
import {
  PricingTable,
  pricingTableConfigSchema,
} from "./commerce/pricing-table/index";
import {
  FileUploader,
  fileUploaderConfigSchema,
} from "./content/file-uploader/index";
import {
  RichTextEditor,
  richTextEditorConfigSchema,
} from "./content/rich-text-editor/index";
import { RichInput, richInputConfigSchema } from "./content/rich-input/index";
import {
  EmojiPicker,
  emojiPickerConfigSchema,
} from "./communication/emoji-picker/index";
import {
  ReactionBar,
  reactionBarConfigSchema,
} from "./communication/reaction-bar/index";
import {
  PresenceIndicator,
  presenceIndicatorConfigSchema,
} from "./communication/presence-indicator/index";
import {
  TypingIndicator,
  typingIndicatorConfigSchema,
} from "./communication/typing-indicator/index";
import {
  MessageThread,
  messageThreadConfigSchema,
} from "./communication/message-thread/index";
import {
  CommentSection,
  commentSectionConfigSchema,
} from "./communication/comment-section/index";
import {
  ChatWindow,
  chatWindowConfigSchema,
} from "./communication/chat-window/index";
import { Popover, popoverConfigSchema } from "./overlay/popover/index";
import { Separator, separatorConfigSchema } from "./data/separator/index";
import {
  CommandPalette,
  commandPaletteConfigSchema,
} from "./overlay/command-palette/index";
import { Input, inputConfigSchema } from "./forms/input/index";
import { Select, selectConfigSchema } from "./forms/select/index";
import { Textarea, textareaConfigSchema } from "./forms/textarea/index";
import { Toggle, toggleConfigSchema } from "./forms/toggle/index";
import { DatePicker, datePickerConfigSchema } from "./forms/date-picker";
import { Slider, sliderConfigSchema } from "./forms/slider";
import { ColorPicker, colorPickerConfigSchema } from "./forms/color-picker";
import {
  MultiSelect,
  multiSelectConfigSchema,
} from "./forms/multi-select/index";
import {
  ContextMenu,
  contextMenuConfigSchema,
} from "./overlay/context-menu/index";
import { ScrollArea, scrollAreaConfigSchema } from "./data/scroll-area/index";
import { FilterBar, filterBarConfigSchema } from "./data/filter-bar/index";
import { InlineEdit, inlineEditConfigSchema } from "./forms/inline-edit/index";
import { Markdown, markdownConfigSchema } from "./content/markdown/index";
import {
  TagSelector,
  tagSelectorConfigSchema,
} from "./forms/tag-selector/index";
import {
  EntityPicker,
  entityPickerConfigSchema,
} from "./data/entity-picker/index";
import {
  HighlightedText,
  highlightedTextConfigSchema,
} from "./data/highlighted-text/index";
import {
  FavoriteButton,
  favoriteButtonConfigSchema,
} from "./data/favorite-button/index";
import {
  NotificationBell,
  notificationBellConfigSchema,
} from "./data/notification-bell/index";
import {
  SaveIndicator,
  saveIndicatorConfigSchema,
} from "./data/save-indicator/index";
import {
  CompareView,
  compareViewConfigSchema,
} from "./content/compare-view/index";
import { QuickAdd, quickAddConfigSchema } from "./forms/quick-add/index";
import {
  LocationInput,
  locationInputConfigSchema,
} from "./forms/location-input/index";
import {
  AvatarGroup,
  avatarGroupConfigSchema,
} from "./data/avatar-group/index";
import { LinkEmbed, linkEmbedConfigSchema } from "./content/link-embed/index";
import {
  GifPicker,
  gifPickerConfigSchema,
} from "./communication/gif-picker/index";
import { Feed, feedSchema } from "./data/feed/index";
import { Chart, chartSchema } from "./data/chart/index";
import { Wizard, wizardSchema } from "./forms/wizard/index";
import {
  DefaultLoading,
  spinnerConfigSchema,
} from "./feedback/default-loading";
import { DefaultError, errorPageConfigSchema } from "./feedback/default-error";
import {
  DefaultNotFound,
  notFoundConfigSchema,
} from "./feedback/default-not-found";
import {
  DefaultOffline,
  offlineBannerConfigSchema,
} from "./feedback/default-offline";
import { Stack, stackConfigSchema } from "./primitives/stack";
import { Text, textConfigSchema } from "./primitives/text";
import { Link, linkConfigSchema } from "./primitives/link";
import { Divider, dividerConfigSchema } from "./primitives/divider";
import {
  FloatingMenu,
  floatingMenuConfigSchema,
} from "./primitives/floating-menu";
import {
  OAuthButtons,
  oauthButtonsConfigSchema,
} from "./primitives/oauth-buttons";
import {
  PasskeyButton,
  passkeyButtonConfigSchema,
} from "./primitives/passkey-button";
import { Carousel, carouselConfigSchema } from "./media/carousel/index";
import { SnapshotImage, snapshotImageSchema } from "./media/image";
import { Video } from "./media/video/index";
import { videoConfigSchema } from "./media/video/schema";
import { Embed } from "./media/embed/index";
import { embedConfigSchema } from "./media/embed/schema";
import { Vote } from "./data/vote/index";
import { voteConfigSchema } from "./data/vote/schema";
import { Banner } from "./content/banner/index";
import { bannerConfigSchema } from "./content/banner/schema";
import { Card, cardConfigSchema } from "./layout/card/index";
import { Column, columnConfigSchema } from "./layout/column/index";
import { Container } from "./layout/container";
import { containerConfigSchema } from "./layout/container/schema";
import { Grid } from "./layout/grid";
import { gridConfigSchema } from "./layout/grid/schema";
import { Row } from "./layout/row";
import { rowConfigSchema } from "./layout/row/schema";
import { Section } from "./layout/section";
import { sectionConfigSchema } from "./layout/section/schema";
import { Spacer } from "./layout/spacer";
import { spacerConfigSchema } from "./layout/spacer/schema";
import { Outlet, outletComponentSchema } from "./layout/outlet/index";
import { SplitPane } from "./layout/split-pane/index";
import { splitPaneConfigSchema } from "./layout/split-pane/schema";
import { Box, boxConfigSchema } from "./layout/box/index";
import {
  Collapsible,
  collapsibleConfigSchema,
} from "./layout/collapsible/index";
import { IconButton, iconButtonConfigSchema } from "./forms/icon-button/index";
import { HoverCard, hoverCardConfigSchema } from "./overlay/hover-card/index";
import {
  ToggleGroup,
  toggleGroupConfigSchema,
} from "./forms/toggle-group/index";
import {
  ConfirmDialogComponent,
  confirmDialogConfigSchema,
} from "./overlay/confirm-dialog/index";
import { NavLogo, navLogoConfigSchema } from "./layout/nav-logo/index";
import { NavLink, navLinkConfigSchema } from "./layout/nav-link/index";
import {
  NavDropdown,
  navDropdownConfigSchema,
} from "./layout/nav-dropdown/index";
import { NavSection, navSectionConfigSchema } from "./layout/nav-section/index";
import { NavSearch, navSearchConfigSchema } from "./layout/nav-search/index";
import {
  NavUserMenu,
  navUserMenuConfigSchema,
} from "./layout/nav-user-menu/index";
import {
  ComponentGroup,
  componentGroupConfigSchema,
} from "./_base/component-group/index";

let builtInComponentsRegistered = false;

/**
 * Register all built-in config-driven components with the manifest system.
 *
 * The function is idempotent so boot code can call it safely without worrying
 * about duplicate registrations.
 */
export function registerBuiltInComponents(force = false): void {
  if (builtInComponentsRegistered && !force) {
    return;
  }

  builtInComponentsRegistered = true;

  registerComponent(
    "stat-card",
    StatCard as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("stat-card", statCardConfigSchema);

  registerComponent(
    "data-table",
    DataTable as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("data-table", dataTableConfigSchema);

  registerComponent(
    "form",
    AutoForm as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("form", autoFormConfigSchema);
  registerComponent(
    "auto-form",
    AutoForm as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("auto-form", autoFormConfigSchema);

  registerComponent(
    "stack",
    Stack as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("stack", stackConfigSchema);

  registerComponent(
    "heading",
    Heading as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("heading", headingConfigSchema);

  registerComponent(
    "text",
    Text as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("text", textConfigSchema);

  registerComponent(
    "code",
    Code as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("code", codeConfigSchema);

  registerComponent(
    "link",
    Link as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("link", linkConfigSchema);

  registerComponent(
    "divider",
    Divider as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("divider", dividerConfigSchema);

  registerComponent(
    "floating-menu",
    FloatingMenu as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("floating-menu", floatingMenuConfigSchema);

  registerComponent(
    "oauth-buttons",
    OAuthButtons as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("oauth-buttons", oauthButtonsConfigSchema);

  registerComponent(
    "passkey-button",
    PasskeyButton as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("passkey-button", passkeyButtonConfigSchema);

  registerComponent(
    "button",
    Button as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("button", buttonConfigSchema);

  registerComponent(
    "detail-card",
    DetailCard as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("detail-card", detailCardConfigSchema);

  registerComponent(
    "modal",
    ModalComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("modal", modalConfigSchema);

  registerComponent(
    "drawer",
    DrawerComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("drawer", drawerConfigSchema);

  registerComponent(
    "tabs",
    TabsComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("tabs", tabsConfigSchema);

  registerComponent("badge", Badge as Parameters<typeof registerComponent>[1]);
  registerComponentSchema("badge", badgeConfigSchema);

  registerComponent(
    "avatar",
    Avatar as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("avatar", avatarConfigSchema);

  registerComponent("alert", Alert as Parameters<typeof registerComponent>[1]);
  registerComponentSchema("alert", alertConfigSchema);

  registerComponent(
    "progress",
    Progress as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("progress", progressConfigSchema);

  registerComponent(
    "skeleton",
    Skeleton as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("skeleton", skeletonConfigSchema);

  registerComponent(
    "switch",
    Switch as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("switch", switchConfigSchema);

  registerComponent(
    "empty-state",
    EmptyState as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("empty-state", emptyStateConfigSchema);

  registerComponent(
    "accordion",
    AccordionComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("accordion", accordionConfigSchema);

  registerComponent(
    "breadcrumb",
    BreadcrumbComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("breadcrumb", breadcrumbConfigSchema);

  registerComponent(
    "list",
    ListComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("list", listConfigSchema);

  registerComponent(
    "tooltip",
    TooltipComponent as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("tooltip", tooltipConfigSchema);

  registerComponent(
    "timeline",
    Timeline as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("timeline", timelineConfigSchema);

  registerComponent(
    "code-block",
    CodeBlock as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("code-block", codeBlockConfigSchema);

  registerComponent(
    "stepper",
    Stepper as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("stepper", stepperConfigSchema);

  registerComponent(
    "tree-view",
    TreeView as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("tree-view", treeViewConfigSchema);

  registerComponent(
    "kanban",
    Kanban as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("kanban", kanbanConfigSchema);

  registerComponent(
    "calendar",
    Calendar as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("calendar", calendarConfigSchema);

  registerComponent(
    "audit-log",
    AuditLog as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("audit-log", auditLogConfigSchema);

  registerComponent(
    "notification-feed",
    NotificationFeed as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("notification-feed", notificationFeedConfigSchema);

  registerComponent(
    "dropdown-menu",
    DropdownMenu as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("dropdown-menu", dropdownMenuConfigSchema);

  registerComponent(
    "pricing-table",
    PricingTable as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("pricing-table", pricingTableConfigSchema);

  registerComponent(
    "file-uploader",
    FileUploader as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("file-uploader", fileUploaderConfigSchema);

  registerComponent(
    "rich-text-editor",
    RichTextEditor as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("rich-text-editor", richTextEditorConfigSchema);

  registerComponent(
    "rich-input",
    RichInput as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("rich-input", richInputConfigSchema);

  registerComponent(
    "emoji-picker",
    EmojiPicker as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("emoji-picker", emojiPickerConfigSchema);

  registerComponent(
    "reaction-bar",
    ReactionBar as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("reaction-bar", reactionBarConfigSchema);

  registerComponent(
    "presence-indicator",
    PresenceIndicator as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("presence-indicator", presenceIndicatorConfigSchema);

  registerComponent(
    "typing-indicator",
    TypingIndicator as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("typing-indicator", typingIndicatorConfigSchema);

  registerComponent(
    "message-thread",
    MessageThread as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("message-thread", messageThreadConfigSchema);

  registerComponent(
    "comment-section",
    CommentSection as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("comment-section", commentSectionConfigSchema);

  registerComponent(
    "chat-window",
    ChatWindow as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("chat-window", chatWindowConfigSchema);

  registerComponent(
    "popover",
    Popover as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("popover", popoverConfigSchema);

  registerComponent(
    "separator",
    Separator as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("separator", separatorConfigSchema);

  registerComponent(
    "command-palette",
    CommandPalette as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("command-palette", commandPaletteConfigSchema);

  registerComponent("input", Input as Parameters<typeof registerComponent>[1]);
  registerComponentSchema("input", inputConfigSchema);

  registerComponent(
    "select",
    Select as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("select", selectConfigSchema);

  registerComponent(
    "date-picker",
    DatePicker as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("date-picker", datePickerConfigSchema);

  registerComponent(
    "slider",
    Slider as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("slider", sliderConfigSchema);

  registerComponent(
    "color-picker",
    ColorPicker as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("color-picker", colorPickerConfigSchema);

  registerComponent(
    "textarea",
    Textarea as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("textarea", textareaConfigSchema);

  registerComponent(
    "toggle",
    Toggle as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("toggle", toggleConfigSchema);

  registerComponent(
    "multi-select",
    MultiSelect as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("multi-select", multiSelectConfigSchema);

  registerComponent(
    "context-menu",
    ContextMenu as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("context-menu", contextMenuConfigSchema);

  registerComponent(
    "scroll-area",
    ScrollArea as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("scroll-area", scrollAreaConfigSchema);

  registerComponent(
    "filter-bar",
    FilterBar as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("filter-bar", filterBarConfigSchema);

  registerComponent(
    "inline-edit",
    InlineEdit as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("inline-edit", inlineEditConfigSchema);

  registerComponent(
    "markdown",
    Markdown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("markdown", markdownConfigSchema);

  registerComponent(
    "tag-selector",
    TagSelector as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("tag-selector", tagSelectorConfigSchema);

  registerComponent(
    "entity-picker",
    EntityPicker as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("entity-picker", entityPickerConfigSchema);

  registerComponent(
    "highlighted-text",
    HighlightedText as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("highlighted-text", highlightedTextConfigSchema);

  registerComponent(
    "favorite-button",
    FavoriteButton as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("favorite-button", favoriteButtonConfigSchema);

  registerComponent(
    "notification-bell",
    NotificationBell as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("notification-bell", notificationBellConfigSchema);

  registerComponent(
    "save-indicator",
    SaveIndicator as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("save-indicator", saveIndicatorConfigSchema);

  registerComponent(
    "compare-view",
    CompareView as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("compare-view", compareViewConfigSchema);

  registerComponent(
    "quick-add",
    QuickAdd as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("quick-add", quickAddConfigSchema);

  registerComponent(
    "location-input",
    LocationInput as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("location-input", locationInputConfigSchema);

  registerComponent(
    "avatar-group",
    AvatarGroup as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("avatar-group", avatarGroupConfigSchema);

  registerComponent(
    "link-embed",
    LinkEmbed as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("link-embed", linkEmbedConfigSchema);

  registerComponent(
    "gif-picker",
    GifPicker as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("gif-picker", gifPickerConfigSchema);

  registerComponent("feed", Feed as Parameters<typeof registerComponent>[1]);
  registerComponentSchema("feed", feedSchema);

  registerComponent("chart", Chart as Parameters<typeof registerComponent>[1]);
  registerComponentSchema("chart", chartSchema);

  registerComponent(
    "wizard",
    Wizard as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("wizard", wizardSchema);

  registerComponent(
    "spinner",
    DefaultLoading as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("spinner", spinnerConfigSchema);

  registerComponent(
    "error-page",
    DefaultError as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("error-page", errorPageConfigSchema);

  registerComponent(
    "not-found",
    DefaultNotFound as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("not-found", notFoundConfigSchema);

  registerComponent(
    "offline-banner",
    DefaultOffline as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("offline-banner", offlineBannerConfigSchema);

  registerComponent(
    "carousel",
    Carousel as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("carousel", carouselConfigSchema);

  registerComponent(
    "image",
    SnapshotImage as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("image", snapshotImageSchema);

  registerComponent(
    "video",
    Video as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("video", videoConfigSchema);

  registerComponent(
    "embed",
    Embed as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("embed", embedConfigSchema);

  registerComponent(
    "vote",
    Vote as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("vote", voteConfigSchema);

  registerComponent(
    "banner",
    Banner as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("banner", bannerConfigSchema);

  registerComponent(
    "row",
    Row as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("row", rowConfigSchema);

  registerComponent(
    "card",
    Card as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("card", cardConfigSchema);

  registerComponent(
    "column",
    Column as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("column", columnConfigSchema);

  registerComponent(
    "container",
    Container as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("container", containerConfigSchema);

  registerComponent(
    "grid",
    Grid as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("grid", gridConfigSchema);

  registerComponent(
    "section",
    Section as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("section", sectionConfigSchema);

  registerComponent(
    "spacer",
    Spacer as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("spacer", spacerConfigSchema);

  registerComponent(
    "outlet",
    Outlet as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("outlet", outletComponentSchema);

  registerComponent(
    "split-pane",
    SplitPane as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("split-pane", splitPaneConfigSchema);

  registerComponent(
    "box",
    Box as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("box", boxConfigSchema);

  registerComponent(
    "collapsible",
    Collapsible as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("collapsible", collapsibleConfigSchema);

  registerComponent(
    "icon-button",
    IconButton as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("icon-button", iconButtonConfigSchema);

  registerComponent(
    "hover-card",
    HoverCard as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("hover-card", hoverCardConfigSchema);

  registerComponent(
    "confirm-dialog",
    ConfirmDialogComponent as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("confirm-dialog", confirmDialogConfigSchema);

  registerComponent(
    "toggle-group",
    ToggleGroup as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("toggle-group", toggleGroupConfigSchema);

  registerComponent(
    "nav-logo",
    NavLogo as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-logo", navLogoConfigSchema);

  registerComponent(
    "nav-link",
    NavLink as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-link", navLinkConfigSchema);

  registerComponent(
    "nav-dropdown",
    NavDropdown as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-dropdown", navDropdownConfigSchema);

  registerComponent(
    "nav-section",
    NavSection as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-section", navSectionConfigSchema);

  registerComponent(
    "nav-search",
    NavSearch as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-search", navSearchConfigSchema);

  registerComponent(
    "nav-user-menu",
    NavUserMenu as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("nav-user-menu", navUserMenuConfigSchema);

  registerComponent(
    "component-group",
    ComponentGroup as unknown as Parameters<typeof registerComponent>[1],
  );
  registerComponentSchema("component-group", componentGroupConfigSchema);
}

/** Reset the built-in component registration guard so tests can rebuild the registry. */
export function resetBuiltInComponentRegistration(): void {
  builtInComponentsRegistered = false;
}
