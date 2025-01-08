import zod from 'zod';

import * as jose from 'jose';

import axios from 'axios';

import pool from '../config/dbConfig.js';

import cryptApi from '../helpers/cryptApi.js';

class ApiController {
  constructor() {
    this.sql = pool.promise();
  }

  addCron = async (req, res) => {
    try {
      const cron = req.body.cron
        ? typeof req.body.cron == 'string'
          ? req.body.cron.trim().toLowerCase()
          : req.body.cron
        : req.body.cron;

      const reqBody = { cron };

      const zodObj = zod.object({
        cron: zod.string().min(1),
      });

      zodObj.parse(reqBody);

      const [rows] = await this.sql.query(
        'INSERT INTO crons (cron) VALUES (?)',
        [cron],
      );

      if (rows?.affectedRows === 0) throw new Error('Unable to add cron!');

      return res.json({ error: false, data: 'Cron added successfully!' });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  getCron = async (req, res) => {
    try {
      const cron_id = req.params.cron_id
        ? typeof req.params.cron_id == 'string'
          ? +req.params.cron_id.trim()
          : req.params.cron_id
        : req.params.cron_id;

      const cron = req.query.cron
        ? typeof req.query.cron === 'string'
          ? req.query.cron.trim().toLowerCase()
          : req.query.cron
        : req.query.cron;

      const reqBody = { cron_id, cron };

      const zodObj = zod.object({
        cron_id: zod.number().int().min(1),
        cron: zod.string().min(1).optional(),
      });

      zodObj.parse(reqBody);

      if (cron !== undefined) {
        const [rows] = await this.sql.query(
          'SELECT * FROM crons WHERE cron = ? AND deleted_at IS NULL',
          [cron],
        );

        return res.json({ error: false, data: rows });
      }

      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE cron_id = ? AND deleted_at IS NULL',
        [cron_id],
      );

      return res.json({ error: false, data: rows });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  getCrons = async (req, res) => {
    try {
      const offset =
        typeof req.query.offset === 'undefined'
          ? 0
          : typeof req.query.offset == 'string'
            ? +req.query.offset.trim()
            : req.query.offset;

      const limit =
        typeof req.query.limit === 'undefined'
          ? Number.MAX_SAFE_INTEGER
          : typeof req.query.limit == 'string'
            ? +req.query.limit.trim()
            : req.query.limit;

      const cron_ids = req.query.cron_ids
        ? typeof req.query.cron_ids === 'string'
          ? req.query.cron_ids.trim()
          : req.query.cron_ids
        : req.query.cron_ids;

      const reqBody = { cron_ids, offset, limit };

      const zodObj = zod.object({
        cron_ids: zod.string().min(1).optional(),
        offset: zod.number().optional(),
        limit: zod.number().optional(),
      });

      zodObj.parse(reqBody);

      if (cron_ids !== undefined) {
        const cron_ids_array = cron_ids.trim().split(',');

        const cron_ids_data = cron_ids_array
          .map((cron_id) => (isNaN(+cron_id) ? null : +cron_id))
          .filter((e) => e);

        const [rows] = await this.sql.query(
          'SELECT * FROM crons WHERE cron_id IN (?) LIMIT ?, ?',
          [cron_ids_data, offset, limit],
        );

        return res.json({ error: false, data: rows });
      }

      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE deleted_at IS NULL LIMIT ?, ?',
        [offset, limit],
      );

      return res.json({ error: false, data: rows });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  updateCron = async (req, res) => {
    try {
      const cron_id = req.params.cron_id
        ? typeof req.params.cron_id == 'string'
          ? +req.params.cron_id.trim()
          : req.params.cron_id
        : req.params.cron_id;

      const cron = req.body.cron
        ? typeof req.body.cron === 'string'
          ? req.body.cron.trim().toLowerCase()
          : req.body.cron
        : req.body.cron;

      const status = req.body.status
        ? typeof req.body.status === 'string'
          ? +req.body.status.trim()
          : req.body.status
        : req.body.status;

      const deleted_at = req.body.deleted_at
        ? typeof req.body.deleted_at === 'string'
          ? +req.body.deleted_at.trim()
          : req.body.deleted_at
        : req.body.deleted_at;

      const reqBody = { cron_id, cron, status, deleted_at };

      const zodObj = zod.object({
        cron_id: zod.number().int().min(1),
        cron: zod.string().min(1).optional(),
        status: zod.number().int().min(0).max(1).optional(),
        deleted_at: zod.number().int().min(0).max(1).optional(),
      });

      zodObj.parse(reqBody);

      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE cron_id = ?',
        [cron_id],
      );

      if (rows?.length === 0) throw new Error('Cron not found!');

      const actualCron = cron !== undefined ? cron : rows[0].cron;

      const actualStatus = status !== undefined ? status : rows[0].status;

      if (deleted_at !== undefined) {
        if (deleted_at === 0) {
          await this.sql.query(
            'UPDATE crons SET cron = ?, status = ?, deleted_at = NULL WHERE cron_id = ?',
            [actualCron, actualStatus, cron_id],
          );

          return res.json({ error: false, data: 'Cron updated successfully!' });
        }

        await this.sql.query(
          'UPDATE crons SET cron = ?, status = ?, deleted_at = NOW() WHERE cron_id = ?',
          [actualCron, actualStatus, cron_id],
        );

        return res.json({ error: false, data: 'Cron updated successfully!' });
      }

      await this.sql.query(
        'UPDATE crons SET cron = ?, status = ? WHERE cron_id = ?',
        [actualCron, actualStatus, cron_id],
      );

      return res.json({ error: false, data: 'Cron updated successfully!' });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  updateCrons = async (req, res) => {
    try {
      const cron_ids = req.body.cron_ids;

      const status = req.body.status
        ? typeof req.body.status === 'string'
          ? +req.body.status.trim()
          : req.body.status
        : req.body.status;

      const deleted_at = req.body.deleted_at
        ? typeof req.body.deleted_at === 'string'
          ? +req.body.deleted_at.trim()
          : req.body.deleted_at
        : req.body.deleted_at;

      const reqBody = { cron_ids, status, deleted_at };

      const zodObj = zod.object({
        cron_ids: zod.array(zod.number().int().min(1)),
        status: zod.number().int().min(0).max(1).optional(),
        deleted_at: zod.number().int().min(0).max(1).optional(),
      });

      zodObj.parse(reqBody);

      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE cron_id IN (?)',
        [cron_ids],
      );

      if (rows?.length === 0)
        return res.json({ error: true, data: 'Crons not found!' });

      const updateCronIds = rows.map((datas) => datas.cron_id);

      if (deleted_at !== undefined) {
        if (deleted_at === 0) {
          await this.sql.query(
            'UPDATE crons SET deleted_at = NULL WHERE cron_id IN (?)',
            [updateCronIds],
          );
        }

        if (deleted_at === 1) {
          await this.sql.query(
            'UPDATE crons SET deleted_at = NOW() WHERE cron_id IN (?)',
            [updateCronIds],
          );
        }
      }

      if (status !== undefined) {
        if (status === 0) {
          await this.sql.query(
            'UPDATE crons SET status = ? WHERE cron_id IN (?)',
            [0, updateCronIds],
          );
        }

        if (status === 1) {
          await this.sql.query(
            'UPDATE crons SET status = ? WHERE cron_id IN (?)',
            [1, updateCronIds],
          );
        }
      }

      return res.json({ error: false, data: 'Crons updated successfully!' });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  deleteCron = async (req, res) => {
    try {
      const cron_id = req.params.cron_id
        ? typeof req.params.cron_id == 'string'
          ? +req.params.cron_id.trim()
          : req.params.cron_id
        : req.params.cron_id;

      const cron = req.body.cron
        ? typeof req.body.cron === 'string'
          ? req.body.cron.trim().toLowerCase()
          : req.body.cron
        : req.body.cron;

      const reqBody = { cron_id, cron };

      const zodObj = zod.object({
        cron_id: zod.number().int().min(1),
        cron: zod.string().min(1).optional(),
      });

      zodObj.parse(reqBody);

      if (cron !== undefined) {
        const [rows] = await this.sql.query(
          'SELECT * FROM crons WHERE cron = ?',
          [cron],
        );

        if (rows?.length === 0) throw new Error('Cron not found!');

        await this.sql.query('DELETE FROM crons WHERE cron = ?', [cron]);

        return res.json({ error: false, data: 'Cron deleted successfully!' });
      }

      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE cron_id = ?',
        [cron_id],
      );

      if (rows?.length === 0) throw new Error('Cron not found!');

      await this.sql.query('DELETE FROM crons WHERE cron_id = ?', [cron_id]);

      return res.json({ error: false, data: 'Cron deleted successfully!' });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  deleteCrons = async (req, res) => {
    try {
      const cron_ids = req.body.cron_ids;

      const reqBody = { cron_ids };

      const zodObj = zod.object({
        cron_ids: zod.array(zod.number().int().min(1)).optional(),
      });

      zodObj.parse(reqBody);

      if (cron_ids !== undefined) {
        const [rows] = await this.sql.query(
          'SELECT * FROM crons WHERE cron_id IN (?)',
          [cron_ids],
        );

        if (rows?.length === 0)
          return res.json({ error: true, data: 'Crons not found!' });

        const deleteCronIds = rows.map((datas) => datas.cron_id);

        await this.sql.query('DELETE FROM crons WHERE cron_id IN (?)', [
          deleteCronIds,
        ]);

        return res.json({ error: false, data: 'Crons deleted successfully!' });
      }

      const result = await this.sql.query(
        'SELECT * FROM crons WHERE deleted_at IS NOT NULL',
        [],
      );

      if (result[0]?.length === 0)
        return res.json({ error: true, data: 'Crons not found!' });

      const [rows] = await this.sql.query(
        'DELETE FROM crons WHERE deleted_at IS NOT NULL',
        [],
      );

      if (rows?.affectedRows === 0)
        return res.json({ error: true, data: 'Crons must marked as deleted!' });

      return res.json({ error: false, data: 'Crons deleted successfully!' });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  supabase = async (req, res) => {
    try {
      console.log(`${req.body} ${req.query}`);

      return res.json({ error: false, body: req.body, query: req.query });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  cf = async (req, res) => {
    try {
      console.log(`${req.body} ${req.query}`);
      return res.json({ error: false, body: req.body, query: req.query });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  run = async (req, res) => {
    try {
      const [rows] = await this.sql.query(
        'SELECT * FROM crons WHERE deleted_at IS NULL',
        [],
      );

      console.log(req.headers);
      console.log(req.query);
      console.log(req.body);

      if (rows?.length === 0) throw new Error('Crons not found!');

      const urls = rows.map((row) => row.cron.trim());

      const limit = 10;

      const requests = urls.map((url) => limit(() => axios.get(url)));

      const responses = await Promise.all(requests);

      // responses.forEach((response, index) => {
      //   console.log(`Response from ${urls[index]}:`, response.data);
      // });

      return res.json({
        error: false,
        data: 'Cron run successfully!',
      });
    } catch (error) {
      console.log(error.message);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  createTable = async (req, res) => {
    try {
      await this.sql.query(`DROP TABLE IF EXISTS crons`, []);

      await this.sql.query(
        `
      CREATE TABLE crons (
          cron_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          cron VARCHAR(255) NOT NULL,
          status TINYINT NOT NULL DEFAULT '1',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (cron_id),
          UNIQUE KEY cron (cron)
          ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci`,
        [],
      );

      return res.json({
        error: false,
        data: `Table crons created successfully!`,
      });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage?.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  createTableToken = async (req, res) => {
    try {
      await this.sql.query(`DROP TABLE IF EXISTS apitokens`, []);

      await this.sql.query(
        `
      CREATE TABLE apitokens (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          apitoken longtext NOT NULL,
          status TINYINT NOT NULL DEFAULT '1',
          created_by BIGINT NULL DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (id)
          ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci`,
        [],
      );

      return res.json({
        error: false,
        data: `Table apitokens created successfully!`,
      });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage?.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  app = async (req, res) => {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET_KEY_CRON_API_APP,
      );

      const rows = [
        {
          user_id: 0,

          u_id: `0`,

          email: `app@lcapis.app`,

          roles: JSON.stringify(['APP']),
        },
      ];

      const jwtToken = await new jose.SignJWT({ data: rows })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(process.env.ISSUER)
        .setAudience(process.env.AUDIENCE)
        // .setExpirationTime(
        //   Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 12,
        // )
        .sign(secret);

      const result = await this.sql.query(
        'SELECT * FROM apitokens WHERE apitoken = ?',
        [cryptApi.encrypt(jwtToken)],
      );

      if (result[0].length !== 0)
        return res.json({ error: true, data: 'Api token already exist!' });

      const resultApiTokens = await this.sql.query(
        'INSERT INTO apitokens (apitoken, created_by) VALUES (?, ?)',
        [cryptApi.encrypt(jwtToken), 0],
      );

      if (resultApiTokens[0]?.affectedRows === 0)
        return res.json({ error: true, data: 'Unbale to add api token!' });

      return res.json({ error: false, data: cryptApi.encrypt(jwtToken) });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage?.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message} `,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };

  test = async (req, res) => {
    try {
      console.log(`${req.body} ${req.query}`);
      return res.json({ error: false, body: req.body, query: req.query });
    } catch (error) {
      console.log(error);

      if (error?.issues) {
        const zodErrorData = JSON.parse(error?.message).map((errorMessage) => {
          if (errorMessage.message)
            return {
              message: `"${errorMessage?.path}" is ${errorMessage?.message}`,
            };
        });

        return res.json({ error: true, data: zodErrorData[0]?.message });
      } else {
        console.log(error?.message.fields);

        if (error?.message?.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        if (error?.message.fields)
          return res.json({
            error: true,
            data: error?.message.fields?.message,
          });

        return res.json({ error: true, data: error?.message });
      }
    }
  };
}

export default ApiController;
