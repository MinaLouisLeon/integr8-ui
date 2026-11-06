import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumnDef,
  DataTableColumnHeader,
  GradientText,
  ThemeProvider,
  ThemeSwitcher,
  useTheme,
} from '@integr8-media/ui';

interface Row {
  id: string;
  name: string;
}

const columns: DataTableColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
];
const data: Row[] = [
  { id: '1', name: 'Ada' },
  { id: '2', name: 'Grace' },
];

function ThemeButtons() {
  const { themes, setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      {themes.map((theme) => (
        <button
          key={theme.name}
          type="button"
          data-testid={`theme-${theme.name}`}
          onClick={() => setTheme(theme.name)}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <main className="grid gap-6 p-6">
        <h1 data-testid="heading">
          Fixture: <GradientText>Tailwind v4</GradientText>
        </h1>
        <ThemeButtons />
        <ThemeSwitcher />
        <Button data-testid="primary-button">Primary</Button>
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card</CardTitle>
          </CardHeader>
          <CardContent>The app's own Tailwind utilities use the tokens too:</CardContent>
        </Card>
        {/* The app's own classes, mapped by theme.css: */}
        <div data-testid="own-utility" className="size-8 rounded-lg bg-brand-1" />
        <DataTable columns={columns} data={data} getRowId={(row) => row.id} />
      </main>
    </ThemeProvider>
  );
}
