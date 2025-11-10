'use client';

export function SimpleAppKitButton() {
  return (
    <div className="flex items-center gap-2">
      {/* This is all you need! AppKit handles EVERYTHING */}
      <w3m-button />
      <w3m-network-button />
    </div>
  );
}

export function MinimalAppKitButton() {
  return <w3m-button />;
}