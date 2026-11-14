export default function ErrorAlert({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <div className="alert alert-danger shadow-sm border-0" role="alert">{mensaje}</div>;
}