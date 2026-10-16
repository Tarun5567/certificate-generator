export default function Logo({ className = 'logo', size }) {
  const style = size ? { width: size, height: size } : undefined
  return (
    <img
      className={className}
      src="/logo.jpg"
      alt="National Academic Examination Board emblem"
      width={size || 120}
      height={size || 120}
      style={style}
    />
  )
}
