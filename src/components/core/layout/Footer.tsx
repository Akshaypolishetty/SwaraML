export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground p-6 mt-auto border-t">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} SwaraML. Real-time Indian Classical Music Analysis.
        </p>
      </div>
    </footer>
  );
}
