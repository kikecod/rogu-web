const DisciplinaBadge = ({ nombre }: { nombre: string }) => (
  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
    {nombre}
  </span>
);

export default DisciplinaBadge;
