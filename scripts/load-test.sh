#!/bin/bash
# ============================================================
# Prueba de carga: N estudiantes creando reportes simultáneamente
# Uso: ./load-test.sh <cantidad_usuarios> <base_url>
# Ejemplo: ./load-test.sh 28 https://hubi.click
# ============================================================

N=${1:-28}
BASE_URL=${2:-https://hubi.click}

# ── Credenciales de prueba ──────────────────────────────────
PASSWORD="Test1234!"

declare -a CEDULAS=(
  "test_0912345678" "test_0912345679" "test_0912345680" "test_0912345681"
  "test_0912345682" "test_0912345683" "test_0912345684" "test_0912345685"
  "test_0912345686" "test_0912345687" "test_0912345688" "test_0912345689"
  "test_0912345690" "test_0912345691" "test_0912345692" "test_0912345693"
  "test_0912345694" "test_0912345695" "test_0912345696" "test_0912345697"
  "test_0912345698" "test_0912345699" "test_0912345700" "test_0912345701"
  "test_0912345702" "test_0912345703" "test_0912345704" "test_0912345705"
  "test_0912345706" "test_0912345707"
)

TOKENS_FILE="/tmp/tokens_$$.txt"
RESULTS_FILE="/tmp/results_$$.txt"
> "$TOKENS_FILE"
> "$RESULTS_FILE"

echo "=== Prueba de carga: $N estudiantes simultáneos ==="
echo "URL: $BASE_URL"
echo ""
echo "=== Paso 1: Obteniendo tokens (login secuencial) ==="
for i in $(seq 0 $((N-1))); do
  CEDULA=${CEDULAS[$i]}
  if [ -z "$CEDULA" ]; then
    echo "  [!] No hay cédula para índice $i, omitiendo"
    continue
  fi

  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login-cedula" \
    -H "Content-Type: application/json" \
    -d "{\"cedula\":\"$CEDULA\",\"password\":\"$PASSWORD\"}" 2>/dev/null)

  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

  if [ -n "$TOKEN" ]; then
    echo "$TOKEN" >> "$TOKENS_FILE"
    echo "  [$i] cédula=$CEDULA → token OK"
  else
    echo "  [$i] cédula=$CEDULA → SIN TOKEN. Respuesta: ${RESPONSE:0:100}"
  fi

  sleep 0.05
done

TOKEN_COUNT=$(wc -l < "$TOKENS_FILE")
echo ""
echo "=== Tokens obtenidos: $TOKEN_COUNT / $N ==="

if [ "$TOKEN_COUNT" -eq 0 ]; then
  echo "❌ No se obtuvo ningún token."
  echo "   Verifica que los usuarios existan con: npx tsx scripts/seed-test-users.ts"
  exit 1
fi

echo ""
echo "=== Paso 2: Disparando $TOKEN_COUNT reportes EN PARALELO ==="
echo ""

START=$(date +%s%N)

i=0
while IFS= read -r TOKEN; do
  i=$((i+1))
  (
    T0=$(date +%s%N)
    HTTP_CODE=$(curl -s -o /tmp/resp_$i.json -w "%{http_code}" -X POST "$BASE_URL/api/reportes" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"titulo":"Prueba de carga","descripcion":"Reporte generado por script de carga","tipo_reporte":"Sugerencia","area":"TI"}')
    T1=$(date +%s%N)
    ELAPSED_MS=$(( (T1 - T0) / 1000000 ))
    echo "usuario=$i http=$HTTP_CODE tiempo=${ELAPSED_MS}ms" >> "$RESULTS_FILE"
  ) &
done < "$TOKENS_FILE"

wait

END=$(date +%s%N)
TOTAL_MS=$(( (END - START) / 1000000 ))
TOTAL_S=$(echo "scale=2; $TOTAL_MS / 1000" | bc)

echo ""
echo "=== Resultados ==="
sort -t= -k2 "$RESULTS_FILE"

echo ""
echo "=== Resumen ==="
TOTAL_REQS=$(wc -l < "$RESULTS_FILE")
OK_200=$(grep -c "http=201\|http=200" "$RESULTS_FILE")
ERRORES=$((TOTAL_REQS - OK_200))

echo "Total peticiones:      $TOTAL_REQS"
echo "Exitosas (200/201):    $OK_200"
echo "Errores/otros códigos: $ERRORES"
echo "Tiempo total (pared):  ${TOTAL_S}s"
echo ""

if [ "$ERRORES" -gt 0 ]; then
  echo "⚠️  Hay errores. Códigos encontrados:"
  grep -oP 'http=\K[0-9]+' "$RESULTS_FILE" | sort | uniq -c
  echo ""
  echo "Revisa /tmp/resp_*.json para ver respuestas con error."
else
  echo "✅ Todas las peticiones respondieron 200/201 correctamente."
fi

rm -f "$TOKENS_FILE" "$RESULTS_FILE"
