export function ErrorBox(props: { error: Error }) {
  return (
    <div className="alert alert-danger">
      <h4>{props.error.name}</h4>
      <pre className="mb-0">
        <code>{props.error.message}</code>
      </pre>
    </div>
  );
}
