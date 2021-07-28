const base = require('./baseController');


exports.getAll = (req, res, next) => {
    getQuery(req, res, next);
}

const getQuery = (req, res, next) => {
    let sql = `SELECT
            req_data.*
        FROM (
            SELECT 
                d.document_id, d.document_type, d.document_number, d.document_date, d.document_state_id, d.document_city_id, 
                ds.document_scope_description,
                di.document_item_id, di.document_item_number, di.document_item_status_id, di.document_item_subject, di.document_item_description,
                iaa.area_id, a.area_name, iaa.area_aspect_id, aa.area_aspect_name, d.document_scope_id,                
                unity_data.area_aspect_id AS aspect, 
                unity_data.customer_unity_name, unity_data.customer_business_name, unity_data.customer_id
            FROM documents d
            INNER JOIN document_items di ON d.document_id = di.document_id
            INNER JOIN items_areas_aspects iaa ON di.document_item_id = iaa.document_item_id 
            INNER JOIN areas a ON iaa.area_id = a.area_id 
            INNER JOIN areas_aspects aa ON iaa.area_aspect_id = aa.area_aspect_id 
            INNER JOIN document_scopes ds ON d.document_scope_id = ds.document_scope_id       
            INNER JOIN (
                SELECT
                    cu.customer_id, cu.customer_unity_id, cu.customer_unity_uf_id, cu.customer_unity_city_id,
                    uaa.area_id, uaa.area_aspect_id, cu.customer_unity_name, cs.customer_business_name
                FROM customers_unities cu
                INNER JOIN unities_areas_aspects uaa ON cu.customer_unity_id = uaa.customer_unity_id 
                INNER JOIN customers cs ON cu.customer_id = cs.customer_id
            ) unity_data ON  
                (d.document_scope_id = 3 /*ESTADUAL*/ AND d.document_city_id = unity_data.customer_unity_city_id AND unity_data.area_aspect_id = iaa.area_aspect_id AND unity_data.area_id = iaa.area_id) OR 
                (d.document_scope_id = 2 /*ESTADUAL*/ AND d.document_state_id = unity_data.customer_unity_uf_id AND unity_data.area_aspect_id = iaa.area_aspect_id AND unity_data.area_id = iaa.area_id) OR 
                ((d.document_scope_id = 1 OR d.document_scope_id = 4)/*FEDERAL ou GLOBAL*/ AND iaa.area_aspect_id = unity_data.area_aspect_id AND unity_data.area_id = iaa.area_id)  
        ) AS req_data
        ${req.params.customerId === 'all' ? '' : `WHERE req_data.customer_id = ${req.params.customerId}`}`
    base.rawquery(sql, req, res, next);
}