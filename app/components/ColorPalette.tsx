interface ColorPaletteProps {
  colors?: string[];
  onColorSelect: (color: string) => void;
  title?: string;
}

export const ColorPalette = ({
  colors,
  onColorSelect,
  title = "Color Palette",
}: ColorPaletteProps) => {
  const presetColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#808080",
    "#ff8080",
    "#80ff80",
    "#8080ff",
    "#ffff80",
    "#ff80ff",
    "#80ffff",
    "#ff8040",
    "#40ff80",
    "#8040ff",
    "#ff4080",
    "#80ff40",
    "#4080ff",
    "#ff8040",
    "#8040ff",
  ];

  const colorsToShow = colors && colors.length > 0 ? colors : presetColors;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-6 gap-1">
        {colorsToShow.map((color, index) => (
          <button
            key={`${color}-${index}`}
            onClick={() => onColorSelect(color)}
            className="h-8 w-8 rounded border border-gray-300 transition-colors hover:border-gray-400"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
