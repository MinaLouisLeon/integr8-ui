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

// Plain inline styles only: this app has no CSS framework of its own.
function ThemeButtons() {
  const { themes, setTheme } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
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
      <main style={{ display: 'grid', gap: 24, padding: 24 }}>
        <h1 data-testid="heading">
          Fixture: <GradientText>no Tailwind</GradientText>
        </h1>
        <ThemeButtons />
        <ThemeSwitcher />
        <Button data-testid="primary-button">Primary</Button>
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card</CardTitle>
          </CardHeader>
          <CardContent>Styled by the prebuilt styles.css.</CardContent>
        </Card>
        <DataTable columns={columns} data={data} getRowId={(row) => row.id} />
      </main>
    </ThemeProvider>
  );
}
