TOKEN=$(cat auth.json | grep idToken | cut -d'"' -f4)
COLLECTIONS=("users" "clients" "customers" "Subscriptions" "subscriptions" "commissions" "settlements" "serials" "licenses" "settings" "transactions")

for coll in "${COLLECTIONS[@]}"; do
  echo "--- Collection: $coll ---"
  curl -s -X GET "https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents/$coll?pageSize=1" -H "Authorization: Bearer $TOKEN" | grep -A 2 "name" | head -n 3
done
