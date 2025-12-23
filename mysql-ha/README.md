# MySQL HA (Master-Master) with HAProxy (Docker Compose)

Short guide to start the cluster and enable GTID-based master-master replication.

## Start containers

1. From the project root:

```bash
cd mysql-ha
docker-compose up -d
```

2. Wait until both MySQL instances are ready (check logs or `docker exec` ping):

```bash
docker logs -f mysql-db1
docker logs -f mysql-db2
# or
docker exec -it mysql-db1 mysqladmin ping -uroot -prootpassword
```

## Create replication user (run on one server or both)
Replace `repl_password` and `rootpassword` as needed.

```bash
# create user on DB2 (example)
docker exec -it mysql-db2 mysql -uroot -prootpassword -e "CREATE USER 'repl'@'%' IDENTIFIED BY 'repl_password'; GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%'; FLUSH PRIVILEGES;"

# (optional) create the same user on DB1 as well
docker exec -it mysql-db1 mysql -uroot -prootpassword -e "CREATE USER 'repl'@'%' IDENTIFIED BY 'repl_password'; GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%'; FLUSH PRIVILEGES;"
```

## Configure GTID-based master-master replication (run on each node)
Using GTID (recommended because we enabled `gtid_mode=ON` in the cnf files).

```bash
# On DB1: point to DB2
docker exec -it mysql-db1 mysql -uroot -prootpassword -e "CHANGE MASTER TO MASTER_HOST='db2', MASTER_USER='repl', MASTER_PASSWORD='repl_password', MASTER_PORT=3306, MASTER_AUTO_POSITION=1; START SLAVE;"

# On DB2: point to DB1
docker exec -it mysql-db2 mysql -uroot -prootpassword -e "CHANGE MASTER TO MASTER_HOST='db1', MASTER_USER='repl', MASTER_PASSWORD='repl_password', MASTER_PORT=3306, MASTER_AUTO_POSITION=1; START SLAVE;"
```

## Verify replication

```bash
docker exec -it mysql-db1 mysql -uroot -prootpassword -e "SHOW SLAVE STATUS\G"
docker exec -it mysql-db2 mysql -uroot -prootpassword -e "SHOW SLAVE STATUS\G"
```

Check that `Slave_IO_Running: Yes` and `Slave_SQL_Running: Yes` on both nodes.

## Quick test

```bash
# create db/table on db1 and insert
docker exec -it mysql-db1 mysql -uroot -prootpassword -e "CREATE DATABASE IF NOT EXISTS testdb; USE testdb; CREATE TABLE IF NOT EXISTS t(a INT PRIMARY KEY AUTO_INCREMENT, b VARCHAR(20)); INSERT INTO t(b) VALUES ('from db1');"
# confirm on db2
docker exec -it mysql-db2 mysql -uroot -prootpassword -e "SELECT * FROM testdb.t;"
```

If rows appear on the other server, replication works both ways.

---

Notes:
- The compose mounts `db1.cnf` and `db2.cnf` into `/etc/mysql/conf.d/` so server-ids, auto_increment offsets, and GTID settings are applied at startup.
- Use strong passwords and secure networking for production.
- If you prefer position-based replication, use `SHOW MASTER STATUS` on the master to get `File` and `Position`, then `CHANGE MASTER TO MASTER_LOG_FILE='...', MASTER_LOG_POS=...;` instead of `MASTER_AUTO_POSITION=1`.
